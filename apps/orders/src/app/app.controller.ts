import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDTO } from '@libs/shared/src';
import { CreateOrderCommand } from './commands/create-order.command';
import { GetOrdersQuery } from './queries/get-orders.query';
import { UpdateOrderStatusCommand } from './commands/update-order-status.command';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern('createOrder')
  async createOrder(@Payload() payload: CreateOrderDTO) {
    this.logger.log('Received createOrder request via RMQ, dispatching CreateOrderCommand', payload);
    return this.commandBus.execute(new CreateOrderCommand(payload));
  }

  @MessagePattern('getAllOrders')
  async getAllOrders() {
    this.logger.log('Received getAllOrders request via RMQ, dispatching GetOrdersQuery');
    return this.queryBus.execute(new GetOrdersQuery());
  }

  @EventPattern('payment.succeeded')
  async handlePaymentSucceeded(@Payload() data: { orderId: string; transactionId: string }) {
    this.logger.log(`Received payment.succeeded event for order ${data.orderId}, dispatching UpdateOrderStatusCommand`);
    return this.commandBus.execute(new UpdateOrderStatusCommand(data.orderId, 'PAID'));
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() data: { orderId: string; reason: string }) {
    this.logger.log(`Received payment.failed event for order ${data.orderId}, dispatching UpdateOrderStatusCommand`);
    return this.commandBus.execute(new UpdateOrderStatusCommand(data.orderId, 'CANCELLED'));
  }
}
