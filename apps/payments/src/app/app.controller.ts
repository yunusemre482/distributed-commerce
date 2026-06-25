import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: { orderId: string; totalAmount: number; userId: string }) {
    this.logger.log(`Received order.created event for orderId: ${data.orderId}`, data);
    return this.appService.processPayment(data);
  }
}
