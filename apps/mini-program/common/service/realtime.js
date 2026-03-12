import configService from './config.service.js';

function toWsUrl(httpUrl) {
  const u = String(httpUrl || '').trim();
  if (!u) return '';
  if (u.startsWith('https://')) return 'wss://' + u.slice('https://'.length) + '/ws';
  if (u.startsWith('http://')) return 'ws://' + u.slice('http://'.length) + '/ws';
  // fallback
  return u.replace(/^\/+/, '') + '/ws';
}

let socketTask = null;
let connecting = false;
let connected = false;
let hasConnectedOnce = false;
let reconnectDelay = 1000;
let reconnectTimer = null;
const subscriptions = new Set(); // key = `${refType}:${refId}`
const listeners = new Set(); // fn(event, data)
const pendingMessages = [];

function emit(event, data) {
  listeners.forEach((fn) => {
    try {
      fn(event, data);
    } catch (e) {}
  });
}

function sendJson(obj) {
  if (!socketTask || !connected) return;
  try {
    socketTask.send({ data: JSON.stringify(obj) });
  } catch (e) {}
}

function ensureConnected() {
  if (connected || connecting) return;
  const url = toWsUrl(configService.apiUrl);
  if (!url) return;
  connecting = true;
  socketTask = uni.connectSocket({
    url,
    complete: () => {},
  });

  socketTask.onOpen(() => {
    connecting = false;
    connected = true;
    const isReconnect = hasConnectedOnce;
    hasConnectedOnce = true;
    reconnectDelay = 1000;
    emit(isReconnect ? 'reconnected' : 'connected', { url });
    // resubscribe
    subscriptions.forEach((key) => {
      const [refType, refId] = String(key).split(':');
      sendJson({ event: 'subscribe', data: { refType, refId } });
    });
    if (pendingMessages.length) {
      const toSend = pendingMessages.splice(0, pendingMessages.length);
      toSend.forEach((obj) => {
        sendJson(obj);
      });
    }
  });

  socketTask.onMessage((res) => {
    try {
      const msg = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      if (msg && msg.event) emit(msg.event, msg.data);
    } catch (e) {}
  });

  const onBroken = () => {
    if (!connecting) {
      connected = false;
      connecting = false;
      emit('disconnected', {});
      scheduleReconnect();
    }
  };
  socketTask.onClose(onBroken);
  socketTask.onError(onBroken);
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectDelay = Math.min(15000, reconnectDelay * 1.6);
    ensureConnected();
  }, reconnectDelay);
}

export default {
  /** 监听 realtime 事件：connected/reconnected/disconnected/content_updated 等 */
  on(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  connect() {
    ensureConnected();
  },
  send(event, data) {
    ensureConnected();
    const obj = { event, data };
    if (connected) sendJson(obj);
    else pendingMessages.push(obj);
  },
  subscribe(refType, refId) {
    const key = String(refType) + ':' + String(refId);
    subscriptions.add(key);
    ensureConnected();
    if (connected) sendJson({ event: 'subscribe', data: { refType, refId: String(refId) } });
  },
  unsubscribe(refType, refId) {
    const key = String(refType) + ':' + String(refId);
    subscriptions.delete(key);
    if (connected) sendJson({ event: 'unsubscribe', data: { refType, refId: String(refId) } });
  },
  close() {
    try {
      if (socketTask) socketTask.close({});
    } catch (e) {}
    socketTask = null;
    connected = false;
    connecting = false;
  },
};

