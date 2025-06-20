import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}


