import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CryptoService } from '../common/crypto/crypto.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,
    private notificationsService: NotificationsService,
    private cryptoService: CryptoService,
    private realtimeGateway: RealtimeGateway,
    private smsService: SmsService,
  ) {}

  async findAll(
    userId?: string,
    page?: number,
    pageSize?: number,
    status?: number,
  ): Promise<{ list: Contract[]; total: number }> {
    const p = Math.max(1, page ?? 1);
    const ps = Math.min(50, Math.max(1, pageSize ?? 10));
    const qb = this.contractsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.lessor', 'lessor')
      .leftJoinAndSelect('c.lessee', 'lessee')
      .leftJoinAndSelect('c.machine', 'machine')
      .orderBy('c.createTime', 'DESC');
    if (userId) {
      qb.andWhere('(c.lessorId = :userId OR c.lesseeId = :userId)', { userId });
    }
    if (status !== undefined && status !== null) {
      qb.andWhere('c.status = :status', { status });
    }
    const [list, total] = await qb
      .skip((p - 1) * ps)
      .take(ps)
      .getManyAndCount();

    const safeList = list.map((c) => this.toSafeContract(c));
    return { list: safeList, total };
  }

  findOne(id: string): Promise<Contract | null> {
    return this.contractsRepository
      .findOne({
        where: { id },
        relations: ['lessor', 'lessee', 'machine'],
      })
      .then((c) => (c ? this.toSafeContract(c) : null));
  }

  async create(contractData: Partial<Contract>): Promise<Contract> {
    const now = new Date();
    const dayStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    const contract = this.contractsRepository.create({
      ...contractData,
      contractNo: 'DD' + dayStr + randomStr,
      status: 0, // 待确认
    });

    // 预约提交 -> 通知供应方
    const saved = await this.contractsRepository.save(contract);
    const recipientId = saved.lessorId;
    if (recipientId) {
      const msg = `订单号：${saved.contractNo}，请尽快确认。`;
      await this.notificationsService.create({
        userId: String(recipientId),
        type: 'order_create',
        title: '您有新的预约待确认',
        content: msg,
        refType: 'order',
        refId: String(saved.id),
      });
      this.smsService.sendToUser(String(recipientId), msg).catch(() => {});
    }
    this.realtimeGateway.notifyContentUpdated('order', String(saved.id));
    return this.toSafeContract(saved);
  }

  async update(
    id: string,
    contractData: Partial<Contract>,
  ): Promise<Contract | null> {
    await this.contractsRepository.update(id, contractData);
    const c = await this.contractsRepository.findOne({
      where: { id },
      relations: ['lessor', 'lessee', 'machine'],
    });
    if (c) this.realtimeGateway.notifyContentUpdated('order', String(id));
    return c ? this.toSafeContract(c) : null;
  }

  /** 供应方确认预约：待确认 -> 待服务 */
  async confirm(id: string, userId: string): Promise<Contract> {
    const contract = await this.contractsRepository.findOneBy({ id });
    if (!contract) throw new BadRequestException('订单不存在');
    if (String(contract.lessorId) !== String(userId)) {
      throw new ForbiddenException('仅供应方可确认订单');
    }
    if (contract.status !== 0) {
      throw new BadRequestException('当前状态不允许确认');
    }
    contract.status = 1; // 待服务
    await this.contractsRepository.save(contract);

    // 通知需求方
    const confirmMsg = `订单号：${contract.contractNo} 已确认，请按约定时间服务。`;
    await this.notificationsService.create({
      userId: String(contract.lesseeId),
      type: 'order_confirm',
      title: '您的预约已被确认',
      content: confirmMsg,
      refType: 'order',
      refId: String(contract.id),
    });
    this.smsService.sendToUser(String(contract.lesseeId), confirmMsg).catch(() => {});
    this.realtimeGateway.notifyContentUpdated('order', String(contract.id));
    return this.toSafeContract(contract);
  }

  /** 任一方取消订单（待确认/待服务） */
  async cancel(
    id: string,
    userId: string,
    reason: string,
  ): Promise<Contract> {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('取消原因必填');
    }
    const contract = await this.contractsRepository.findOneBy({ id });
    if (!contract) throw new BadRequestException('订单不存在');
    const isParty =
      String(contract.lessorId) === String(userId) ||
      String(contract.lesseeId) === String(userId);
    if (!isParty) throw new ForbiddenException('仅订单双方可取消');
    if (contract.status !== 0 && contract.status !== 1) {
      throw new BadRequestException('当前状态不允许取消');
    }
    contract.status = 3; // 已取消
    contract.cancelReason = reason.trim();
    await this.contractsRepository.save(contract);

    const otherUserId =
      String(contract.lessorId) === String(userId)
        ? contract.lesseeId
        : contract.lessorId;
    await this.notificationsService.create({
      userId: String(otherUserId),
      type: 'order_cancel',
      title: '订单已被取消',
      content: `订单号：${contract.contractNo} 已取消，原因：${contract.cancelReason}`,
      refType: 'order',
      refId: String(contract.id),
    });
    this.realtimeGateway.notifyContentUpdated('order', String(contract.id));
    return this.toSafeContract(contract);
  }

  /** 任一方确认完成：待服务 -> 已完成 */
  async complete(id: string, userId: string): Promise<Contract> {
    const contract = await this.contractsRepository.findOneBy({ id });
    if (!contract) throw new BadRequestException('订单不存在');
    const isParty =
      String(contract.lessorId) === String(userId) ||
      String(contract.lesseeId) === String(userId);
    if (!isParty) throw new ForbiddenException('仅订单双方可操作');
    if (contract.status !== 1) {
      throw new BadRequestException('当前状态不允许完成');
    }
    contract.status = 2; // 已完成
    await this.contractsRepository.save(contract);

    const otherUserId =
      String(contract.lessorId) === String(userId)
        ? contract.lesseeId
        : contract.lessorId;
    const completeMsg = `订单号：${contract.contractNo} 已完成，请知悉。`;
    await this.notificationsService.create({
      userId: String(otherUserId),
      type: 'order_complete',
      title: '订单已完成',
      content: completeMsg,
      refType: 'order',
      refId: String(contract.id),
    });
    this.smsService.sendToUser(String(otherUserId), completeMsg).catch(() => {});
    this.realtimeGateway.notifyContentUpdated('order', String(contract.id));
    return this.toSafeContract(contract);
  }

  /** 统一脱敏手机号，避免前端直接拿到明文 */
  private toSafeContract(c: Contract): Contract {
    const clone: any = { ...c };
    const maskPhone = (phone?: string | null) => {
      if (!phone) return '';
      const raw = this.cryptoService.decrypt(phone) ?? phone;
      return raw.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
    };
    if (clone.lessor) {
      clone.lessor = { ...clone.lessor, phone: maskPhone(clone.lessor.phone) };
    }
    if (clone.lessee) {
      clone.lessee = { ...clone.lessee, phone: maskPhone(clone.lessee.phone) };
    }
    return clone as Contract;
  }
}
