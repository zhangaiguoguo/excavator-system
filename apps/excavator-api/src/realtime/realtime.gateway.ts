import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets/interfaces';
import type { Server, WebSocket } from 'ws';

type RefType = 'machine' | 'demand' | 'contract';
type SubscriptionKey = `${RefType}:${string}`;

@WebSocketGateway({ path: '/ws' })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private keyToClients = new Map<SubscriptionKey, Set<WebSocket>>();
  private clientToKeys = new Map<WebSocket, Set<SubscriptionKey>>();

  handleConnection(client: WebSocket) {
    this.clientToKeys.set(client, new Set());
    client.send(
      JSON.stringify({
        event: 'connected',
        data: { ts: Date.now() },
      }),
    );
  }

  handleDisconnect(client: WebSocket) {
    const keys = this.clientToKeys.get(client);
    if (keys) {
      keys.forEach((key) => {
        const set = this.keyToClients.get(key);
        if (set) {
          set.delete(client);
          if (set.size === 0) this.keyToClients.delete(key);
        }
      });
    }
    this.clientToKeys.delete(client);
  }

  @SubscribeMessage('subscribe')
  subscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: { refType: RefType; refId: string },
  ) {
    const refType = body?.refType;
    const refId = body?.refId;
    if (!refType || !refId) {
      return { event: 'error', data: { message: 'refType/refId required' } };
    }
    if (refType !== 'machine' && refType !== 'demand') {
      return { event: 'error', data: { message: 'refType not supported' } };
    }
    const key = `${refType}:${String(refId)}` as SubscriptionKey;

    if (!this.clientToKeys.has(client)) this.clientToKeys.set(client, new Set());
    this.clientToKeys.get(client)!.add(key);

    if (!this.keyToClients.has(key)) this.keyToClients.set(key, new Set());
    this.keyToClients.get(key)!.add(client);

    return { event: 'subscribed', data: { refType, refId: String(refId) } };
  }

  @SubscribeMessage('unsubscribe')
  unsubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: { refType: RefType; refId: string },
  ) {
    const refType = body?.refType;
    const refId = body?.refId;
    if (!refType || !refId) {
      return { event: 'error', data: { message: 'refType/refId required' } };
    }
    const key = `${refType}:${String(refId)}` as SubscriptionKey;
    this.clientToKeys.get(client)?.delete(key);
    const set = this.keyToClients.get(key);
    if (set) {
      set.delete(client);
      if (set.size === 0) this.keyToClients.delete(key);
    }
    return { event: 'unsubscribed', data: { refType, refId: String(refId) } };
  }

  @SubscribeMessage('chat_message')
  handleChat(
    @ConnectedSocket() client: WebSocket,
    @MessageBody()
    body: {
      refType: RefType;
      refId: string;
      text: string;
      fromUserId?: string;
      fromName?: string;
    },
  ) {
    const refType = body?.refType;
    const refId = body?.refId;
    const text = (body?.text || '').trim();
    if (!refType || !refId || !text) {
      return { event: 'error', data: { message: 'refType/refId/text required' } };
    }
    if (refType !== 'machine' && refType !== 'demand') {
      return { event: 'error', data: { message: 'refType not supported' } };
    }
    const key = `${refType}:${String(refId)}` as SubscriptionKey;
    const clients = this.keyToClients.get(key);
    if (!clients || clients.size === 0) return;
    const payload = JSON.stringify({
      event: 'chat_message',
      data: {
        refType,
        refId: String(refId),
        text,
        fromUserId: body.fromUserId ? String(body.fromUserId) : undefined,
        fromName: body.fromName || '用户',
        ts: new Date().toISOString(),
      },
    });
    clients.forEach((c) => {
      try {
        c.send(payload);
      } catch {}
    });
    return { event: 'sent', data: { ok: true } };
  }

  notifyContentUpdated(refType: RefType, refId: string) {
    const key = `${refType}:${String(refId)}` as SubscriptionKey;
    const clients = this.keyToClients.get(key);
    if (!clients || clients.size === 0) return;
    const payload = JSON.stringify({
      event: 'content_updated',
      data: {
        refType,
        refId: String(refId),
        updatedAt: new Date().toISOString(),
      },
    });
    clients.forEach((c) => {
      try {
        c.send(payload);
      } catch {}
    });
  }
}

