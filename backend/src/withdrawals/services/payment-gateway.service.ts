import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaymentGatewayService implements IPaymentGateway {
  async processWithdrawal(
    amount: number,
    bankDetails: any,
    userId: string,
  ): Promise<{ transactionId: string; status: string }> {
    return {
      transactionId: `WD-${Date.now()}-${userId}`,
      status: 'PENDING',
    };
  }

  async getWithdrawalStatus(transactionId: string): Promise<{ status: string; details?: any }> {
    return {
      status: 'PENDING',
      details: {},
    };
  }
}

