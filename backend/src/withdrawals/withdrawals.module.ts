import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService, PaymentGatewayService],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}

