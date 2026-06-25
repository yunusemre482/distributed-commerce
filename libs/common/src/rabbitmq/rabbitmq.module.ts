import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { url } from 'inspector';

interface RmqModuleOptions {
  queue: string;
  name: string;
}

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMqModule {
  static register({ name, queue }: RmqModuleOptions): DynamicModule {
    return {
      module: RabbitMqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => {
              const urls = [configService.get<string>('RABBIT_MQ_URI') ?? 'amqp://rabbitmq:rabbitmq@127.0.0.1:5672/vhost']
              const queueName = configService.get<string>('RABBIT_MQ_SERVICE_QUEUE') ?? queue

              console.log('RabbitMQ URL:', urls)
              console.log('RabbitMQ Queue:', queueName)

              return {
                transport: Transport.RMQ,
                options: {
                  urls: urls,
                  queue: queueName,
                  queueOptions: {
                    arguments: {
                      'x-queue-type': 'quorum',
                    },
                  },
                },
              }

            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
