import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrdersQuery } from './get-orders.query';
import { OrderRepository } from '../repositories/order.repository';
import { Logger } from '@nestjs/common';

@QueryHandler(GetOrdersQuery)
export class GetOrdersQueryHandler implements IQueryHandler<GetOrdersQuery> {
  private readonly logger = new Logger(GetOrdersQueryHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrdersQuery) {
    this.logger.log('Executing GetOrdersQuery: fetching all orders from PostgreSQL');
    return this.orderRepository.findAllOrders();
  }
}
