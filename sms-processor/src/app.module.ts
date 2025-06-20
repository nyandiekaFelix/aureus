import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsModule } from './sms/sms.module';
import { ParserModule } from './parser/parser.module';
import { SyncModule } from './sync/sync.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RabbitMQModule,
    SmsModule,
    ParserModule,
    SyncModule,
    EventsModule,
  ],
})
export class AppModule {}


