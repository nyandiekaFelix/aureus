import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './common/events/events.module';
import { GoalsModule } from './goals/goals.module';
import { GoldModule } from './gold/gold.module';
import { HealthController } from './common/health/health.controller';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { KycModule } from './kyc/kyc.module';
import { LedgerModule } from './ledger/ledger.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';
import { RedisModule } from './common/redis/redis.module';
import { RewardsModule } from './rewards/rewards.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    RabbitMQModule,
    AuthModule,
    UsersModule,
    RewardsModule,
    KycModule,
    GoldModule,
    TransactionsModule,
    GoalsModule,
    WithdrawalsModule,
    LedgerModule,
    EventsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}

