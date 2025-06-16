import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../common/rabbitmq/rabbitmq.service';

@Injectable()
export class EventsService {
  constructor(private rabbitMQ: RabbitMQService) {}

  async publishProcessedSms(data: {
    userId: string;
    messageId: string;
    category: string;
    parsedData: any;
    timestamp: string;
  }) {
    await this.rabbitMQ.publish('sms.events', 'sms.processed', data);
  }
}

