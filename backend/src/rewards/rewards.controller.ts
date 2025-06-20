import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('rewards')
@Controller('rewards')
@ApiBearerAuth()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user rewards' })
  async getRewards(@CurrentUser() user: any) {
    const dbUser = await this.rewardsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.rewardsService.getUserRewards(dbUser.id);
  }

  @Get('points')
  @ApiOperation({ summary: 'Get total reward points' })
  async getTotalPoints(@CurrentUser() user: any) {
    const dbUser = await this.rewardsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return { points: await this.rewardsService.getTotalPoints(dbUser.id) };
  }

  @Post(':id/redeem')
  @ApiOperation({ summary: 'Redeem reward' })
  async redeemReward(@CurrentUser() user: any, @Param('id') id: string) {
    const dbUser = await this.rewardsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.rewardsService.redeemReward(dbUser.id, id);
  }
}


