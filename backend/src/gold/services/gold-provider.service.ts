import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGoldProvider } from '../interfaces/gold-provider.interface';
import axios from 'axios';

@Injectable()
export class GoldProviderService implements IGoldProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get('GOLD_PROVIDER_API_URL', 'https://api.goldprovider.com');
    this.apiKey = this.configService.get('GOLD_PROVIDER_API_KEY', '');
  }

  async getCurrentPrice(): Promise<number> {
    try {
      const response = await axios.get(`${this.apiUrl}/price`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.data.price;
    } catch (error) {
      throw new Error('Failed to fetch gold price');
    }
  }

  async buyGold(amount: number, userId: string): Promise<{ transactionId: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/buy`,
        { amount, userId },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );
      return {
        transactionId: response.data.transactionId,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error('Failed to buy gold');
    }
  }

  async sellGold(quantity: number, userId: string): Promise<{ transactionId: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sell`,
        { quantity, userId },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );
      return {
        transactionId: response.data.transactionId,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error('Failed to sell gold');
    }
  }

  async getTransactionStatus(transactionId: string): Promise<{ status: string; details?: any }> {
    try {
      const response = await axios.get(`${this.apiUrl}/transaction/${transactionId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return {
        status: response.data.status,
        details: response.data,
      };
    } catch (error) {
      throw new Error('Failed to get transaction status');
    }
  }
}

