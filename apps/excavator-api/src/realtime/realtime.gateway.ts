import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets/interfaces';
import type { Server, WebSocket } from 'ws';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Machine } from '../machines/machine.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatMessage } from './chat-message.entity';
import { RefType as RefTypeEnum } from '@excavator/types';

type RefType = 'machine' | 'demand' | 'contract' | 'order';
type SubscriptionKey = `${RefType}:${string}`;

@WebSocketGateway({ path: '/ws' })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private keyToClients = new Map<SubscriptionKey, Set<WebSocket>>();
  private clientToKeys = new Map<WebSocket, Set<SubscriptionKey>>();

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Machine)
    private readonly machinesRepo: Repository<Machine>,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

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
    if (refType !== RefTypeEnum.MACHINE && refType !== RefTypeEnum.DEMAND) {
      return { event: 'error', data: { message: 'refType not supported' } };
    }
    const key = `${refType}:${String(refId)}` as SubscriptionKey;

    if (!this.clientToKeys.has(client))
      this.clientToKeys.set(client, new Set());
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
    const key = `${refType}:${String(refId)}`;
    this.clientToKeys.get(client)?.delete(key as SubscriptionKey);
    const set = this.keyToClients.get(key as SubscriptionKey);
    if (set) {
      set.delete(client);
      if (set.size === 0) this.keyToClients.delete(key as SubscriptionKey);
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
      toUserId?: string;
    },
  ) {
    const refType = body?.refType;
    const refId = body?.refId;
    const text = (body?.text || '').trim();
    if (!refType || !refId || !text) {
      return {
        event: 'error',
        data: { message: 'refType/refId/text required' },
      };
    }
    if (refType !== RefTypeEnum.MACHINE && refType !== RefTypeEnum.DEMAND) {
      return { event: 'error', data: { message: 'refType not supported' } };
    }
    const fromUserId = body.fromUserId ? String(body.fromUserId) : undefined;
    const fromName = body.fromName || '用户';
    const toUserId = body.toUserId ? String(body.toUserId) : undefined;
    const ts = new Date().toISOString();

    // 写入聊天消息表，便于后续拉取历史
    void this.chatRepo.save(
      this.chatRepo.create({
        refType,
        refId: String(refId),
        fromUserId: fromUserId || '',
        toUserId: toUserId || null,
        content: text,
      }),
    );

    // 推送给在线订阅者
    const key = `${refType}:${String(refId)}` as SubscriptionKey;
    const clients = this.keyToClients.get(key);
    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        event: 'chat_message',
        data: {
          refType,
          refId: String(refId),
          text,
          fromUserId,
          fromName,
          ts,
        },
      });
      clients.forEach((c) => {
        try {
          c.send(payload);
        } catch {
          /* empty */
        }
      });
    }

    // 生成消息通知，对方登录后可在消息通知里看到
    void this.createChatNotification(
      refType,
      String(refId),
      text,
      fromUserId,
      fromName,
      toUserId,
    );

    return { event: 'sent', data: { ok: true } };
  }

  /** 实时共享位置：广播给同会话所有订阅者（含自己，便于多端同步） */
  @SubscribeMessage('location_share')
  handleLocationShare(
    @MessageBody()
    body: {
      refType: RefType;
      refId: string;
      latitude: number;
      longitude: number;
      fromUserId?: string;
      fromName?: string;
      timestamp?: number;
    },
  ) {
    const refType = body?.refType;
    const refId = body?.refId;
    if (!refType || !refId || body.latitude == null || body.longitude == null) {
      return { event: 'error', data: { message: 'refType/refId/latitude/longitude required' } };
    }
    if (refType !== RefTypeEnum.MACHINE && refType !== RefTypeEnum.DEMAND) {
      return { event: 'error', data: { message: 'refType not supported' } };
    }
    const key = `${refType}:${String(refId)}` as SubscriptionKey;
    const clients = this.keyToClients.get(key);
    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        event: 'location_share',
        data: {
          refType,
          refId: String(refId),
          latitude: Number(body.latitude),
          longitude: Number(body.longitude),
          fromUserId: body.fromUserId ? String(body.fromUserId) : undefined,
          fromName: body.fromName || '用户',
          timestamp: body.timestamp ?? Date.now(),
        },
      });
      clients.forEach((c) => {
        try {
          c.send(payload);
        } catch {
          /* empty */
        }
      });
    }
    return { event: 'sent', data: { ok: true } };
  }

  /** 结束实时共享位置 */
  @SubscribeMessage('location_share_end')
  handleLocationShareEnd(
    @MessageBody()
    body: { refType: RefType; refId: string; fromUserId?: string },
  ) {
    const refType = body?.refType;
    const refId = body?.refId;
    if (!refType || !refId) {
      return { event: 'error', data: { message: 'refType/refId required' } };
    }
    const key = `${refType}:${String(refId)}` as SubscriptionKey;
    const clients = this.keyToClients.get(key);
    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        event: 'location_share_end',
        data: {
          refType,
          refId: String(refId),
          fromUserId: body.fromUserId ? String(body.fromUserId) : undefined,
        },
      });
      clients.forEach((c) => {
        try {
          c.send(payload);
        } catch {
          /* empty */
        }
      });
    }
    return { event: 'sent', data: { ok: true } };
  }

  notifyContentUpdated(refType: RefType, refId: string) {
    const key = `${refType}:${String(refId)}`;
    const clients = this.keyToClients.get(key as SubscriptionKey);
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
      } catch {
        /* empty */
      }
    });
  }

  private async createChatNotification(
    refType: RefType,
    refId: string,
    text: string,
    fromUserId?: string,
    fromName?: string,
    toUserId?: string,
  ): Promise<void> {
    try {
      let targetUserId: string | undefined;
      if (toUserId) {
        // 前端指定了接收人（如机主回复时传访客 id）
        if (fromUserId && String(toUserId) === String(fromUserId)) return;
        targetUserId = toUserId;
      } else {
        if (refType === RefTypeEnum.DEMAND) {
          const demand = await this.ordersRepo.findOne({
            where: { id: refId },
          });
          if (demand) targetUserId = String(demand.userId);
        } else if (refType === RefTypeEnum.MACHINE) {
          const machine = await this.machinesRepo.findOne({
            where: { id: refId },
          });
          if (machine) targetUserId = String(machine.userId);
        }
        if (
          fromUserId &&
          targetUserId &&
          String(targetUserId) === String(fromUserId)
        )
          return;
      }
      if (!targetUserId) return;

      const preview = text.length > 100 ? text.slice(0, 100) + '...' : text;
      await this.notificationsService.create({
        userId: targetUserId,
        type: 'chat_message',
        title: fromName || '聊天',
        content: preview,
        refType,
        refId,
        fromUserId: fromUserId || undefined,
      });
    } catch {
      // 忽略通知失败，避免影响聊天
    }
  }
}
