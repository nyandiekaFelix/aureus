import { Cron, CronExpression } from '@nestjs/schedule';

import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateSipDto } from './dto/create-sip.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async createGoal(userId: string, createGoalDto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        ...createGoalDto,
        targetAmount: createGoalDto.targetAmount,
      },
    });
  }

  async updateGoal(goalId: string, updateData: Partial<CreateGoalDto>) {
    return this.prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });
  }

  async getUserGoals(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      include: { sips: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGoal(goalId: string) {
    return this.prisma.goal.findUnique({
      where: { id: goalId },
      include: { sips: true },
    });
  }

  async createSip(createSipDto: CreateSipDto) {
    return this.prisma.sIP.create({
      data: createSipDto,
    });
  }

  async getSips(goalId: string) {
    return this.prisma.sIP.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateGoalProgress(goalId: string, amount: number) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const newAmount = Number(goal.currentAmount) + amount;
    const status = newAmount >= Number(goal.targetAmount) ? 'COMPLETED' : goal.status;

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: newAmount,
        status,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async executeSips() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sips = await this.prisma.sIP.findMany({
      where: {
        status: 'ACTIVE',
        nextExecutionDate: {
          lte: today,
        },
      },
      include: {
        goal: true,
      },
    });

    for (const sip of sips) {
      try {
        await this.transactionsService.buyGold(sip.goal.userId, {
          type: 'BUY',
          amount: Number(sip.amount),
          metadata: { sipId: sip.id, goalId: sip.goalId },
        });

        await this.updateGoalProgress(sip.goalId, Number(sip.amount));

        const nextDate = this.calculateNextDate(sip.frequency, sip.nextExecutionDate);
        await this.prisma.sIP.update({
          where: { id: sip.id },
          data: {
            nextExecutionDate: nextDate,
            lastExecutedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to execute SIP ${sip.id}:`, error);
      }
    }
  }

  private calculateNextDate(frequency: string, currentDate: Date): Date {
    const next = new Date(currentDate);
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    return next;
  }
}


