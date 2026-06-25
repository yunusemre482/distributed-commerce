import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Outbox } from '../entities/outbox.entity';

@Injectable()
export class OrderRepository {
  protected readonly logger = new Logger(OrderRepository.name);

  constructor(
    @InjectRepository(Order)
    private readonly _orderRepository: Repository<Order>,
  ) {}

  async createOrderWithOutbox(order: Partial<Order>, event: { eventType: string; payload: string }): Promise<Order> {
    return this._orderRepository.manager.transaction(async (transactionalEntityManager) => {
      const newOrder = transactionalEntityManager.create(Order, order);
      const savedOrder = await transactionalEntityManager.save(Order, newOrder);

      const payloadObj = JSON.parse(event.payload);
      payloadObj.orderId = savedOrder.id;

      const outbox = transactionalEntityManager.create(Outbox, {
        eventType: event.eventType,
        payload: JSON.stringify(payloadObj),
        processed: false,
      });
      await transactionalEntityManager.save(Outbox, outbox);

      return savedOrder;
    });
  }

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
    const order = await this.findOrderById(id);
    if (!order) {
      this.logger.warn(`Order ${id} not found for status update.`);
      return null;
    }

    if (order.status === 'PAID' || order.status === 'CANCELLED') {
      this.logger.warn(`Order ${id} is already in a terminal state: ${order.status}. Cannot transition to ${status}.`);
      return order;
    }

    order.status = status;
    return this._orderRepository.save(order);
  }
}
