import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { GoldModule } from '../gold/gold.module';
import { LedgerModule } from '../ledger/ledger.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [GoldModule, LedgerModule, RewardsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}


