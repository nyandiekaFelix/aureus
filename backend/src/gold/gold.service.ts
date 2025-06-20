import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { GoldProviderService } from './services/gold-provider.service';

@Injectable()
export class GoldService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private goldProvider: GoldProviderService,
  ) {}

  async getCurrentPrice(): Promise<number> {
    const cacheKey = 'gold:price:current';
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return parseFloat(cached);
    }

    const price = await this.goldProvider.getCurrentPrice();
    await this.redis.set(cacheKey, price.toString(), 60);
    return price;
  }

  async getHoldings(userId: string) {
    const holding = await this.prisma.goldHolding.findUnique({
      where: { userId },
    });

    if (!holding) {
      return {
        quantity: 0,
        avgPrice: 0,
        currentValue: 0,
      };
    }

    const currentPrice = await this.getCurrentPrice();
    return {
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice,
      currentValue: Number(holding.quantity) * currentPrice,
    };
  }

  async updateHoldings(userId: string, quantity: number, price: number) {
    const existing = await this.prisma.goldHolding.findUnique({
      where: { userId },
    });

    if (!existing) {
      return this.prisma.goldHolding.create({
        data: {
          userId,
          quantity,
          avgPrice: price,
        },
      });
    }

    const totalQuantity = Number(existing.quantity) + quantity;
    const totalValue = Number(existing.quantity) * Number(existing.avgPrice) + quantity * price;
    const newAvgPrice = totalQuantity > 0 ? totalValue / totalQuantity : price;

    return this.prisma.goldHolding.update({
      where: { userId },
      data: {
        quantity: totalQuantity,
        avgPrice: newAvgPrice,
        lastUpdated: new Date(),
      },
    });
  }
}


