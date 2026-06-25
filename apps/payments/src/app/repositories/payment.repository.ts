import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  protected readonly logger = new Logger(PaymentRepository.name);

  constructor(
    @InjectRepository(Payment)
    private readonly _paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const newPayment = this._paymentRepository.create(payment);
    return this._paymentRepository.save(newPayment);
  }

  async findPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return this._paymentRepository.findOne({ where: { orderId } });
  }
}
