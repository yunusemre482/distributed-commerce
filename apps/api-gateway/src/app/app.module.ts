import { MiddlewareConsumer, Module, ValidationPipe, ArgumentsHost } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import { PaymentModule } from '../payment/payment.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GlobalResponseInterceptor } from '../middlewares/response.middleware';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { ProfilerMiddleware } from '../middlewares/profiler.middleware';
import { GlobalExceptionFilter } from '../middlewares/error.handler';
import { WinstonLoggerService } from '../middlewares/winston-logger.handler';
import { InternationalizationModule } from '@libs/common/src/internationalization/internationalization.module';
import { I18nValidationException, I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { CustomI18nValidationExceptionFilter } from '../middlewares/custom-i18n.exception.filter';
import { RedisModule } from '@libs/common/src';
import { IdempotencyInterceptor } from '../middlewares/idempotency.interceptor';
import { TraceMiddleware } from '../middlewares/trace.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development','.env.production','.env.development.example','.env.production.example'],
      isGlobal: true,
    }),
    InternationalizationModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PaymentModule,
    OrdersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        always: true,
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          return new I18nValidationException(errors);
        },
      }),
    },
    {
      provide: APP_PIPE,
      useValue: new I18nValidationPipe({
        always: true,
        whitelist: true,
        stopAtFirstError: true,
        transform: true,
        skipMissingProperties: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CustomI18nValidationExceptionFilter,
    }
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
