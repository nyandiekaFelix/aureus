import { Injectable, OnModuleInit } from '@nestjs/common';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { TransactionsService } from '../../transactions/transactions.service';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    private rabbitMQ: RabbitMQService,
    private transactionsService: TransactionsService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQ.consume(
      'sms-processed-queue',
      'sms.events',
      'sms.processed',
      async (message) => {
        console.log('Received SMS processed event:', message);
      },
    );

    await this.rabbitMQ.consume(
      'transaction-status-queue',
      'transactions.events',
      'transaction.status',
      async (message) => {
        if (message.transactionId && message.status) {
          await this.transactionsService.updateTransactionStatus(
            message.transactionId,
            message.status,
          );
        }
      },
    );
  }
}

