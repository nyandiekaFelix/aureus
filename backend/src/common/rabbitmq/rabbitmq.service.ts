import * as amqp from 'amqplib';

import { Channel, Connection, connect } from 'amqp-connection-manager';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private channels: Map<string, Channel> = new Map();

  constructor(private configService: ConfigService) {
    const url = this.configService.get('RABBITMQ_URL', 'amqp://localhost:5672');
    this.connection = connect([url]);
  }

  async onModuleInit() {
    this.channel = await this.connection.createChannel();
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    await this.connection.close();
  }

  async getChannel(name: string): Promise<Channel> {
    if (!this.channels.has(name)) {
      const channel = await this.connection.createChannel();
      this.channels.set(name, channel);
    }
    return this.channels.get(name)!;
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<void> {
    const channel = await this.getChannel('publish');
    await channel.assertExchange(exchange, 'topic', { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  async consume(
    queue: string,
    exchange: string,
    routingKey: string,
    callback: (message: any) => Promise<void>,
  ): Promise<void> {
    const channel = await this.getChannel(queue);
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          channel.nack(msg, false, true);
        }
      }
    });
  }
}


