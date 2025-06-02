import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateAccount(
    userId: string,
    accountType: string,
    name: string,
  ) {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: {
        userId_accountType_name: {
          userId,
          accountType,
          name,
        },
      },
    });

    if (account) {
      return account;
    }

    return this.prisma.ledgerAccount.create({
      data: {
        userId,
        accountType,
        name,
        balance: 0,
      },
    });
  }

  async postTransaction(
    userId: string,
    debitAccountName: string,
    creditAccountName: string,
    amount: number,
    transactionId?: string,
    description?: string,
  ) {
    const debitAccount = await this.getOrCreateAccount(userId, 'ASSET', debitAccountName);
    const creditAccount = await this.getOrCreateAccount(userId, 'LIABILITY', creditAccountName);

    if (debitAccount.accountType === 'ASSET') {
      await this.prisma.ledgerAccount.update({
        where: { id: debitAccount.id },
        data: {
          balance: { increment: amount },
        },
      });
    } else {
      await this.prisma.ledgerAccount.update({
        where: { id: debitAccount.id },
        data: {
          balance: { decrement: amount },
        },
      });
    }

    if (creditAccount.accountType === 'LIABILITY') {
      await this.prisma.ledgerAccount.update({
        where: { id: creditAccount.id },
        data: {
          balance: { increment: amount },
        },
      });
    } else {
      await this.prisma.ledgerAccount.update({
        where: { id: creditAccount.id },
        data: {
          balance: { decrement: amount },
        },
      });
    }

    return this.prisma.ledgerEntry.create({
      data: {
        userId,
        debitAccountId: debitAccount.id,
        creditAccountId: creditAccount.id,
        amount,
        transactionId,
        description,
      },
    });
  }

  async getAccountBalance(userId: string, accountName: string): Promise<number> {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: {
        userId_accountType_name: {
          userId,
          accountType: 'ASSET',
          name: accountName,
        },
      },
    });

    return account ? Number(account.balance) : 0;
  }

  async getLedgerEntries(userId: string, limit = 100) {
    return this.prisma.ledgerEntry.findMany({
      where: { userId },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getAccounts(userId: string) {
    return this.prisma.ledgerAccount.findMany({
      where: { userId },
      orderBy: { accountType: 'asc' },
    });
  }

  async reconcileAccount(userId: string, accountName: string) {
    const account = await this.prisma.ledgerAccount.findFirst({
      where: {
        userId,
        name: accountName,
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const debitEntries = await this.prisma.ledgerEntry.aggregate({
      where: {
        debitAccountId: account.id,
      },
      _sum: {
        amount: true,
      },
    });

    const creditEntries = await this.prisma.ledgerEntry.aggregate({
      where: {
        creditAccountId: account.id,
      },
      _sum: {
        amount: true,
      },
    });

    const calculatedBalance =
      (debitEntries._sum.amount || 0) - (creditEntries._sum.amount || 0);

    await this.prisma.ledgerAccount.update({
      where: { id: account.id },
      data: { balance: calculatedBalance },
    });

    return {
      accountId: account.id,
      currentBalance: Number(account.balance),
      calculatedBalance: Number(calculatedBalance),
      matches: Number(account.balance) === Number(calculatedBalance),
    };
  }
}

