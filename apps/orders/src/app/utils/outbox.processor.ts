import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENTS_SERVICE } from '@libs/constants/src';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbox } from '../entities/outbox.entity';

@Injectable()
export class OutboxProcessor implements OnModuleInit {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
    @Inject(PAYMENTS_SERVICE)
    private readonly paymentClient: ClientProxy,
  ) {}

  onModuleInit() {
    setInterval(() => {
      this.processOutbox().catch((err) => {
        this.logger.error('Error running outbox processor', err);
      });
    }, 2000);
  }

  async processOutbox() {
    const pendingEvents = await this.outboxRepository.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: 10,
    });

    if (pendingEvents.length === 0) return;

    this.logger.debug(`Found ${pendingEvents.length} pending outbox events.`);

    for (const event of pendingEvents) {
      try {
        this.logger.log(`Publishing outbox event ${event.eventType} (${event.id})`);
        
        this.paymentClient.emit(event.eventType, JSON.parse(event.payload));
        
        event.processed = true;
        event.processedAt = new Date();
        await this.outboxRepository.save(event);
      } catch (err: any) {
        this.logger.error(`Failed to process outbox event ${event.id}: ${err.message || err}`);
      }
    }
  }
}
