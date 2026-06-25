import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { Inject, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENTS_SERVICE, PRODUCTS_SERVICE } from '@libs/constants/src';
import { OrderRepository } from '../repositories/order.repository';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { CircuitBreaker } from '../utils/circuit-breaker';

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderCommandHandler.name);
  
  private readonly productsCircuitBreaker = new CircuitBreaker(
    'ProductsServiceRPC',
    3,       // Fail threshold
    15000,   // Cooldown period: 15 seconds
  );

  constructor(
    private readonly orderRepository: OrderRepository,
    @Inject(PRODUCTS_SERVICE) private readonly productClient: ClientProxy,
    @Inject(PAYMENTS_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  async execute(command: CreateOrderCommand) {
    const { dto } = command;
    this.logger.log(`Executing CreateOrderCommand for product ${dto.productId}`);

    const product = await this.productsCircuitBreaker.execute(
      async () => {
        this.logger.debug(`Sending getProductById RPC request for product ${dto.productId}`);
        const response = await firstValueFrom(
          this.productClient.send('getProductById', dto.productId).pipe(timeout(3000)),
        );
        if (!response) {
          throw new NotFoundException('Product not found in products catalog.');
        }
        return response;
      },
      async () => {
        this.logger.warn(`Products RPC failed or circuit is open. Falling back.`);
        throw new ServiceUnavailableException(
          'Product catalog service is temporarily unavailable. Please try again later.'
        );
      }
    );

    const totalAmount = product.price * dto.quantity;

    const order = await this.orderRepository.createOrderWithOutbox(
      {
        userId: dto.userId,
        productId: dto.productId,
        productName: product.name,
        productPrice: product.price,
        quantity: dto.quantity,
        totalAmount: totalAmount,
        status: 'PENDING_PAYMENT',
      },
      {
        eventType: 'order.created',
        payload: JSON.stringify({
          totalAmount: totalAmount,
          userId: dto.userId,
        }),
      }
    );

    this.logger.log(`Order ${order.id} and outbox event saved atomically.`);
    return order;
  }
}
