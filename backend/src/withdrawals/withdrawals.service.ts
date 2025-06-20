import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RabbitMQService } from '../common/rabbitmq/rabbitmq.service';
import { LedgerService } from '../ledger/ledger.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private rabbitMQ: RabbitMQService,
    private ledgerService: LedgerService,
    private paymentGateway: PaymentGatewayService,
  ) {}

  async createWithdrawal(userId: string, createWithdrawalDto: CreateWithdrawalDto) {
    const cashBalance = await this.ledgerService.getAccountBalance(userId, 'User Cash Balance');
    if (cashBalance < createWithdrawalDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const gatewayResult = await this.paymentGateway.processWithdrawal(
      createWithdrawalDto.amount,
      createWithdrawalDto.bankDetails,
      userId,
    );

    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId,
        amount: createWithdrawalDto.amount,
        paymentMethod: createWithdrawalDto.paymentMethod,
        bankDetails: createWithdrawalDto.bankDetails,
        transactionId: gatewayResult.transactionId,
        status: 'PENDING',
      },
    });

    await this.ledgerService.postTransaction(
      userId,
      'Withdrawal Processing',
      'User Cash Balance',
      createWithdrawalDto.amount,
      withdrawal.id,
      'Withdrawal request',
    );

    await this.rabbitMQ.publish('withdrawals.events', 'withdrawal.created', {
      userId,
      withdrawalId: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
    });

    return withdrawal;
  }

  async getWithdrawals(userId: string) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWithdrawal(id: string) {
    return this.prisma.withdrawal.findUnique({
      where: { id },
    });
  }

  async updateWithdrawalStatus(id: string, status: string) {
    const withdrawal = await this.prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        processedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    if (status === 'COMPLETED') {
      await this.rabbitMQ.publish('withdrawals.events', 'withdrawal.completed', {
        userId: withdrawal.userId,
        withdrawalId: withdrawal.id,
        amount: withdrawal.amount,
      });
    } else if (status === 'FAILED') {
      await this.ledgerService.postTransaction(
        withdrawal.userId,
        'User Cash Balance',
        'Withdrawal Processing',
        Number(withdrawal.amount),
        withdrawal.id,
        'Withdrawal reversal',
      );
    }

    return withdrawal;
  }
}


