import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { RabbitMQService } from '../common/rabbitmq/rabbitmq.service';
import { GoldProviderService } from '../gold/services/gold-provider.service';
import { GoldService } from '../gold/gold.service';
import { LedgerService } from '../ledger/ledger.service';
import { RewardsService } from '../rewards/rewards.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private rabbitMQ: RabbitMQService,
    private goldProvider: GoldProviderService,
    private goldService: GoldService,
    private ledgerService: LedgerService,
    private rewardsService: RewardsService,
  ) {}

  async buyGold(userId: string, createTransactionDto: CreateTransactionDto) {
    const price = await this.goldService.getCurrentPrice();
    const goldQuantity = createTransactionDto.amount / price;

    const providerResult = await this.goldProvider.buyGold(createTransactionDto.amount, userId);

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'BUY',
        amount: createTransactionDto.amount,
        goldQuantity,
        status: 'PENDING',
        providerRef: providerResult.transactionId,
        metadata: createTransactionDto.metadata,
      },
    });

    await this.ledgerService.postTransaction(
      userId,
      'User Cash Balance',
      'Gold Provider Payable',
      createTransactionDto.amount,
      transaction.id,
      'Gold purchase',
    );

    await this.rabbitMQ.publish('transactions.events', 'transaction.created', {
      userId,
      transactionId: transaction.id,
      type: transaction.type,
      status: transaction.status,
    });

    return transaction;
  }

  async sellGold(userId: string, createTransactionDto: CreateTransactionDto) {
    const holdings = await this.goldService.getHoldings(userId);
    if (holdings.quantity < (createTransactionDto.goldQuantity || 0)) {
      throw new Error('Insufficient gold holdings');
    }

    const price = await this.goldService.getCurrentPrice();
    const amount = (createTransactionDto.goldQuantity || 0) * price;

    const providerResult = await this.goldProvider.sellGold(
      createTransactionDto.goldQuantity || 0,
      userId,
    );

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'SELL',
        amount,
        goldQuantity: createTransactionDto.goldQuantity,
        status: 'PENDING',
        providerRef: providerResult.transactionId,
        metadata: createTransactionDto.metadata,
      },
    });

    await this.ledgerService.postTransaction(
      userId,
      'User Cash Balance',
      'User Gold Holdings',
      amount,
      transaction.id,
      'Gold sale',
    );

    await this.rabbitMQ.publish('transactions.events', 'transaction.created', {
      userId,
      transactionId: transaction.id,
      type: transaction.type,
      status: transaction.status,
    });

    return transaction;
  }

  async getTransactionHistory(userId: string, limit = 50) {
    const cacheKey = `transactions:history:${userId}:${limit}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) {
      return cached;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    await this.redis.setJSON(cacheKey, transactions, 120);
    return transactions;
  }

  async getTransaction(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
    });
  }

  async updateTransactionStatus(transactionId: string, status: string) {
    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });

    if (status === 'COMPLETED') {
      if (transaction.type === 'BUY') {
        await this.goldService.updateHoldings(
          transaction.userId,
          Number(transaction.goldQuantity || 0),
          Number(transaction.amount) / Number(transaction.goldQuantity || 1),
        );
      } else if (transaction.type === 'SELL') {
        await this.goldService.updateHoldings(
          transaction.userId,
          -Number(transaction.goldQuantity || 0),
          0,
        );
      }

      const rewardPoints = await this.rewardsService.calculateReward('TRANSACTION', Number(transaction.amount));
      if (rewardPoints > 0) {
        await this.rewardsService.createReward(transaction.userId, {
          type: 'TRANSACTION',
          points: rewardPoints,
          description: `Reward for ${transaction.type} transaction`,
        });
      }

      await this.rabbitMQ.publish('transactions.events', 'transaction.completed', {
        userId: transaction.userId,
        transactionId: transaction.id,
        type: transaction.type,
      });
    }

    await this.redis.del(`transactions:history:${transaction.userId}:*`);
    return transaction;
  }
}


