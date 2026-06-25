import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderRepository {
  protected readonly logger = new Logger(OrderRepository.name);

  constructor(
    @InjectRepository(Order)
    private readonly _orderRepository: Repository<Order>,
  ) {}

  async createOrder(order: Partial<Order>): Promise<Order> {
    const newOrder = this._orderRepository.create(order);
    return this._orderRepository.save(newOrder);
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this._orderRepository.findOne({ where: { id } });
  }

  async findAllOrders(): Promise<Order[]> {
    return this._orderRepository.find();
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    await this._orderRepository.update(id, { status });
    return this.findOrderById(id);
  }
}
