import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(private readonly configService: ConfigService) { }

  getOptions(queue: string, noAck = false): RmqOptions {
    const queueName = this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`);
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBIT_MQ_URI') ?? "amqp://rabbitmq:rabbitmq@127.0.0.1:5672/vhost"],
        queue: queueName,
        noAck,
        persistent: true,
        prefetchCount: 50,
        queueOptions: {
          arguments: {
            'x-queue-type': 'quorum',
          },
        },
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
