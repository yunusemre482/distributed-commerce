import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDERS_SERVICE } from '@libs/constants/src';
import { PaymentRepository } from './repositories/payment.repository';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    @Inject(ORDERS_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  async processPayment(data: { orderId: string; totalAmount: number; userId: string }) {
    this.logger.log(`Processing payment for order ${data.orderId} - Amount: ${data.totalAmount}`);

    // Simulated gateway check (Stripe mockup logic)
    const isSuccess = data.totalAmount > 0;
    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const transactionId = isSuccess 
      ? `TX_${Math.random().toString(36).substring(2, 9).toUpperCase()}` 
      : 'TX_FAILED_INSUFFICIENT_FUNDS';

    const payment = await this.paymentRepository.createPayment({
      orderId: data.orderId,
      amount: data.totalAmount,
      status: status,
      transactionId: transactionId,
    });

    this.logger.log(`Payment processed for order ${data.orderId} with status: ${status}`);

    if (isSuccess) {
      this.orderClient.emit('payment.succeeded', {
        orderId: data.orderId,
        transactionId: payment.transactionId,
      });
    } else {
      this.orderClient.emit('payment.failed', {
        orderId: data.orderId,
        reason: 'Payment failed due to insufficient amount value.',
      });
    }

    return payment;
  }
}
