import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async createReward(userId: string, createRewardDto: CreateRewardDto) {
    return this.prisma.reward.create({
      data: {
        userId,
        ...createRewardDto,
        points: createRewardDto.points,
      },
    });
  }

  async getUserRewards(userId: string) {
    return this.prisma.reward.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTotalPoints(userId: string) {
    const rewards = await this.prisma.reward.aggregate({
      where: {
        userId,
        status: 'ACTIVE',
      },
      _sum: {
        points: true,
      },
    });

    return rewards._sum.points || 0;
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = await this.prisma.reward.findFirst({
      where: {
        id: rewardId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!reward) {
      throw new Error('Reward not found or already redeemed');
    }

    return this.prisma.reward.update({
      where: { id: rewardId },
      data: { status: 'REDEEMED' },
    });
  }

  async calculateReward(type: string, amount: number): Promise<number> {
    const rules: Record<string, number> = {
      TRANSACTION: 0.01,
      REFERRAL: 100,
      SIGNUP: 50,
    };

    const rate = rules[type] || 0;
    return Math.floor(amount * rate);
  }
}

