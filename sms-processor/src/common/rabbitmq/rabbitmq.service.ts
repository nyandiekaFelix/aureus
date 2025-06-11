import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqp-connection-manager';

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
}

