import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresDatabaseModule, RabbitMqModule } from '@libs/common/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { PAYMENTS_SERVICE, PAYMENTS_SERVICE_QUEUE, PRODUCTS_SERVICE, PRODUCTS_SERVICE_QUEUE } from '@libs/constants/src';
import { OrderRepository } from './repositories/order.repository';

// CQRS Handlers
import { CreateOrderCommandHandler } from './commands/create-order.handler';
import { UpdateOrderStatusCommandHandler } from './commands/update-order-status.handler';
import { GetOrdersQueryHandler } from './queries/get-orders.handler';

const CommandHandlers = [CreateOrderCommandHandler, UpdateOrderStatusCommandHandler];
const QueryHandlers = [GetOrdersQueryHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.development.example', '.env.production', '.env.production.example'],
      isGlobal: true,
    }),
    PostgresDatabaseModule,
    CqrsModule,
    TypeOrmModule.forFeature([Order]),
    RabbitMqModule.register({
      name: PRODUCTS_SERVICE,
      queue: PRODUCTS_SERVICE_QUEUE,
    }),
    RabbitMqModule.register({
      name: PAYMENTS_SERVICE,
      queue: PAYMENTS_SERVICE_QUEUE,
    }),
  ],
  controllers: [AppController],
  providers: [
    OrderRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class AppModule {}
