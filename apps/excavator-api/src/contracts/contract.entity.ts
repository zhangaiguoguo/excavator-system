import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Machine } from '../machines/machine.entity';

/** 订单/意向单（MVP 阶段替代复杂电子合同） */
@Entity('t_contract')
export class Contract {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  /** 订单号：YYYYMMDD + 随机数 */
  @Column({ name: 'contract_no', length: 32, unique: true })
  contractNo: string;

  /** 关联设备（设备租赁场景） */
  @Column({ name: 'machine_id', type: 'bigint', nullable: true })
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  /** 关联需求ID，用于从需求列表发起预约 */
  @Column({ name: 'demand_id', type: 'bigint', nullable: true })
  demandId: string;

  /** 需求方（租用方）ID */
  @Column({ name: 'lessee_id', type: 'bigint' })
  lesseeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lessee_id' })
  lessee: User;

  /** 供应方（出租方/揽活方）ID */
  @Column({ name: 'lessor_id', type: 'bigint' })
  lessorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lessor_id' })
  lessor: User;

  /** 需求方电话（加密存储） */
  @Column({ name: 'demand_phone', length: 64, nullable: true, type: 'varchar' })
  demandPhone: string | null;

  /** 供应方电话（加密存储） */
  @Column({ name: 'supply_phone', length: 64, nullable: true, type: 'varchar' })
  supplyPhone: string | null;

  /** 服务类型：设备租赁 / 驾驶员找活 等 */
  @Column({ name: 'service_type', length: 32, nullable: true, type: 'varchar' })
  serviceType: string | null;

  /** 资源ID：设备ID或揽活ID */
  @Column({ name: 'resource_id', type: 'bigint', nullable: true })
  resourceId: string | null;

  /** 资源快照：型号、品牌、技能等，防止后续修改引起纠纷 */
  @Column({ name: 'resource_info', type: 'json', nullable: true })
  resourceInfo: any | null;

  /** 价格单位：元/天、元/小时 等 */
  @Column({ name: 'price_unit', length: 32, nullable: true, type: 'varchar' })
  priceUnit: string | null;

  /** 预估总价（仅展示，不结算） */
  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalPrice: number | null;

  /** 服务开始时间 */
  @Column({ name: 'service_start_time', type: 'datetime', nullable: true })
  serviceStartTime: Date | null;

  /** 服务结束时间 */
  @Column({ name: 'service_end_time', type: 'datetime', nullable: true })
  serviceEndTime: Date | null;

  /** 服务地点（文字地址，可附带经纬度的序列化） */
  @Column({
    name: 'service_location',
    length: 255,
    nullable: true,
    type: 'varchar',
  })
  serviceLocation: string | null;

  /** 需求方备注 */
  @Column({
    name: 'demand_remark',
    length: 500,
    nullable: true,
    type: 'varchar',
  })
  demandRemark: string | null;

  /** 取消/拒绝原因 */
  @Column({
    name: 'cancel_reason',
    length: 255,
    nullable: true,
    type: 'varchar',
  })
  cancelReason: string | null;

  /**
   * 订单状态：
   * 0 待确认（供应方确认前）
   * 1 待服务（供应方已确认）
   * 2 已完成
   * 3 已取消
   */
  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'create_by', length: 64, default: '' })
  createBy: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_by', length: 64, default: '' })
  updateBy: string;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
