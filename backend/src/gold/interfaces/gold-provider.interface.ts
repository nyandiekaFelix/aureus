export interface IGoldProvider {
  getCurrentPrice(): Promise<number>;
  buyGold(amount: number, userId: string): Promise<{ transactionId: string; status: string }>;
  sellGold(quantity: number, userId: string): Promise<{ transactionId: string; status: string }>;
  getTransactionStatus(transactionId: string): Promise<{ status: string; details?: any }>;
}


