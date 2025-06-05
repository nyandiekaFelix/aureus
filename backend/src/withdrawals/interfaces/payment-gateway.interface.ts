export interface IPaymentGateway {
  processWithdrawal(
    amount: number,
    bankDetails: any,
    userId: string,
  ): Promise<{ transactionId: string; status: string }>;
  getWithdrawalStatus(transactionId: string): Promise<{ status: string; details?: any }>;
}

