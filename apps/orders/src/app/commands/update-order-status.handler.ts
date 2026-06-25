import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrderStatusCommand } from './update-order-status.command';
import { OrderRepository } from '../repositories/order.repository';
import { Logger } from '@nestjs/common';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusCommandHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  private readonly logger = new Logger(UpdateOrderStatusCommandHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOrderStatusCommand) {
    const { orderId, status } = command;
    this.logger.log(`Executing UpdateOrderStatusCommand: updating order ${orderId} status to ${status}`);
    return this.orderRepository.updateOrderStatus(orderId, status);
  }
}
