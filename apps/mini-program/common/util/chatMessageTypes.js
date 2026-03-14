/**
 * 聊天消息内容：以 JSON 存储，带 type 与各类型字段（语音时长、图片/视频/语音地址、位置等）。
 * 兼容旧版纯文本格式（[位置]、[语音] 等），解析时统一为同一结构。
 */

// 消息类型枚举（存 JSON 时用）
export const MSG_TYPE = {
  TEXT: 'text',
  VOICE: 'voice',
  IMAGE: 'image',
  VIDEO: 'video',
  LOCATION: 'location',
};

// 旧版前缀（兼容解析用，新消息不再使用）
export const TAGS = {
  LOCATION: '[位置]',
  VOICE: '[语音]',
  IMAGE: '[图片]',
  VIDEO: '[视频]',
};

function tryParseJson(str) {
  if (typeof str !== 'string' || !str.trim()) return null;
  const s = str.trim();
  if (s[0] !== '{') return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * 判断是否为 JSON 格式消息（新版）
 */
export function isJsonContent(content) {
  return tryParseJson(content) != null;
}

/**
 * 构建要存储/发送的消息内容（JSON 字符串）
 * @param {string} type - MSG_TYPE.text | voice | image | video | location
 * @param {object} payload - 各类型字段
 * @returns {string} JSON 字符串，直接存库或通过 socket 发送
 */
export function buildContent(type, payload = {}) {
  const obj = { type };
  if (type === MSG_TYPE.TEXT) {
    obj.text = payload.text != null ? String(payload.text) : '';
  } else if (type === MSG_TYPE.VOICE) {
    obj.duration = payload.duration != null ? Number(payload.duration) : 0;
    if (payload.url) obj.url = String(payload.url);
  } else if (type === MSG_TYPE.IMAGE || type === MSG_TYPE.VIDEO) {
    obj.url = payload.url ? String(payload.url) : '';
  } else if (type === MSG_TYPE.LOCATION) {
    obj.address = payload.address != null ? String(payload.address) : '';
    obj.longitude = payload.longitude != null ? Number(payload.longitude) : 0;
    obj.latitude = payload.latitude != null ? Number(payload.latitude) : 0;
  }
  return JSON.stringify(obj);
}

/**
 * 从旧版文本解析出类型与字段（兼容）
 */
function parseLegacyContent(raw) {
  const text = raw || '';
  if (text.startsWith(TAGS.LOCATION)) {
    const lines = text.split('\n');
    const address = (lines[1] || lines[0].replace(TAGS.LOCATION, '').trim()) || '位置';
    const coords = (lines[2] || '').split(',');
    const longitude = parseFloat(coords[0]) || 0;
    const latitude = parseFloat(coords[1]) || 0;
    return { type: MSG_TYPE.LOCATION, address, longitude, latitude, text };
  }
  if (text.startsWith(TAGS.VOICE)) {
    const parts = text.split('|');
    const left = (parts[0] || '').replace(TAGS.VOICE, '').replace(/"/g, '').trim();
    const duration = left;
    const url = (parts[1] || '').trim();
    return { type: MSG_TYPE.VOICE, duration, url: url || undefined, text };
  }
  if (text.startsWith(TAGS.IMAGE)) {
    const url = text.length > TAGS.IMAGE.length ? text.replace(TAGS.IMAGE, '').trim() : '';
    return { type: MSG_TYPE.IMAGE, url, text };
  }
  if (text.startsWith(TAGS.VIDEO)) {
    const url = text.length > TAGS.VIDEO.length ? text.replace(TAGS.VIDEO, '').trim() : '';
    return { type: MSG_TYPE.VIDEO, url, text };
  }
  return { type: MSG_TYPE.TEXT, text };
}

/**
 * 解析消息内容（支持新版 JSON + 旧版文本），返回统一结构供 UI 使用
 * @param {string} raw - 库/接口返回的 content 字符串
 * @returns {object} { type, text, isLocation, isVoice, isImage, isVideo, locationAddr, imageUrl, videoUrl, voiceDuration, voiceUrl }
 */
export function parseContent(raw) {
  const parsed = tryParseJson(raw);
  let type, text, url, duration, address, longitude, latitude;
  if (parsed && parsed.type) {
    type = parsed.type;
    if (type === MSG_TYPE.TEXT) text = parsed.text != null ? String(parsed.text) : '';
    else {
      text = '';
      if (type === MSG_TYPE.VOICE) {
        duration = parsed.duration != null ? String(parsed.duration) : '';
        url = parsed.url || '';
      } else if (type === MSG_TYPE.IMAGE || type === MSG_TYPE.VIDEO) {
        url = parsed.url || '';
      } else if (type === MSG_TYPE.LOCATION) {
        address = parsed.address != null ? String(parsed.address) : '';
        longitude = parsed.longitude;
        latitude = parsed.latitude;
      }
    }
  } else {
    const legacy = parseLegacyContent(raw);
    type = legacy.type;
    text = legacy.text;
    url = legacy.url;
    duration = legacy.duration;
    address = legacy.address;
    longitude = legacy.longitude;
    latitude = legacy.latitude;
  }
  return {
    type: type || MSG_TYPE.TEXT,
    text: text || raw || '',
    isLocation: type === MSG_TYPE.LOCATION,
    isVoice: type === MSG_TYPE.VOICE,
    isImage: type === MSG_TYPE.IMAGE,
    isVideo: type === MSG_TYPE.VIDEO,
    locationAddr: address !== undefined ? address : '',
    imageUrl: type === MSG_TYPE.IMAGE ? (url || '') : '',
    videoUrl: type === MSG_TYPE.VIDEO ? (url || '') : '',
    voiceDuration: type === MSG_TYPE.VOICE ? (duration || '') : '',
    voiceUrl: type === MSG_TYPE.VOICE ? (url || '') : '',
  };
}

// ---------- 兼容旧 API：保留 TAGS 与 build* 供外部直接拼字符串（已废弃，建议用 buildContent）----------
export function isLocation(text) {
  const p = tryParseJson(text);
  if (p && p.type) return p.type === MSG_TYPE.LOCATION;
  return (text || '').startsWith(TAGS.LOCATION);
}
export function isVoice(text) {
  const p = tryParseJson(text);
  if (p && p.type) return p.type === MSG_TYPE.VOICE;
  return (text || '').startsWith(TAGS.VOICE);
}
export function isImage(text) {
  const p = tryParseJson(text);
  if (p && p.type) return p.type === MSG_TYPE.IMAGE;
  return (text || '').startsWith(TAGS.IMAGE);
}
export function isVideo(text) {
  const p = tryParseJson(text);
  if (p && p.type) return p.type === MSG_TYPE.VIDEO;
  return (text || '').startsWith(TAGS.VIDEO);
}

export function parseLocation(text) {
  const c = parseContent(text);
  return { address: c.locationAddr, lines: [] };
}
export function parseVoice(text) {
  const c = parseContent(text);
  return { duration: c.voiceDuration, url: c.voiceUrl };
}
export function parseMediaUrl(text, tag) {
  const p = tryParseJson(text);
  if (p && p.type === MSG_TYPE.IMAGE) return p.url || '';
  if (p && p.type === MSG_TYPE.VIDEO) return p.url || '';
  if (!(text || '').startsWith(tag) || text.length <= tag.length) return '';
  return text.replace(tag, '').trim();
}

/**
 * 生成消息列表/通知用的预览文案（类型+摘要，吸引点击）
 * @param {string} raw - 消息 content
 * @param {number} maxTextLen - 文本类型最多显示字数，默认 20
 * @returns {{ label: string, preview: string, type: string }}
 */
export function getMessagePreview(raw, maxTextLen = 20) {
  const c = parseContent(raw);
  const type = c.type || MSG_TYPE.TEXT;
  let label = '';
  let preview = '';
  if (type === MSG_TYPE.TEXT) {
    label = '消息';
    const t = (c.text || '').trim();
    preview = t.length > maxTextLen ? t.slice(0, maxTextLen) + '…' : t || '发来一条消息';
  } else if (type === MSG_TYPE.VOICE) {
    label = '语音';
    preview = c.voiceDuration ? `语音 ${c.voiceDuration}"` : '语音消息';
  } else if (type === MSG_TYPE.IMAGE) {
    label = '图片';
    preview = '[图片]';
  } else if (type === MSG_TYPE.VIDEO) {
    label = '视频';
    preview = '[视频]';
  } else if (type === MSG_TYPE.LOCATION) {
    label = '位置';
    preview = c.locationAddr ? c.locationAddr : '位置消息';
  } else {
    label = '消息';
    preview = raw && raw.length > maxTextLen ? raw.slice(0, maxTextLen) + '…' : (raw || '新消息');
  }
  return { label, preview, type };
}

/** 旧版拼接（兼容），新逻辑请用 buildContent */
export function buildLocation(address, lng, lat) {
  return buildContent(MSG_TYPE.LOCATION, { address, longitude: lng, latitude: lat });
}
export function buildVoice(duration, url = '') {
  return buildContent(MSG_TYPE.VOICE, { duration, url: url || undefined });
}
export function buildImage(url) {
  return buildContent(MSG_TYPE.IMAGE, { url: url || '' });
}
export function buildVideo(url) {
  return buildContent(MSG_TYPE.VIDEO, { url: url || '' });
}
