import { EventsService } from './events.service';
import { Module } from '@nestjs/common';
import { TransactionsModule } from '../../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}


