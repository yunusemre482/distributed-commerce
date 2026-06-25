import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PostgresDatabaseModule, RabbitMqModule } from '@libs/common/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { ORDERS_SERVICE, ORDERS_SERVICE_QUEUE } from '@libs/constants/src';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.development.example', '.env.production', '.env.production.example'],
      isGlobal: true,
    }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([Payment]),
    RabbitMqModule.register({
      name: ORDERS_SERVICE,
      queue: ORDERS_SERVICE_QUEUE,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PaymentRepository],
})
export class AppModule {}
