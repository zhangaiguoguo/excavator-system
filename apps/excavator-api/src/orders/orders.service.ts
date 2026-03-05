import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ 
      relations: ['user'],
      order: { createTime: 'DESC' }
    });
  }

  findOne(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.ordersRepository.create(orderData);
    return this.ordersRepository.save(order);
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order | null> {
    await this.ordersRepository.update(id, orderData);
    return this.ordersRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.ordersRepository.delete(id);
  }
}
