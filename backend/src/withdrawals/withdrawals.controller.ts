import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('withdrawals')
@Controller('withdrawals')
@ApiBearerAuth()
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create withdrawal request' })
  async createWithdrawal(
    @CurrentUser() user: any,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ) {
    const dbUser = await this.withdrawalsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.withdrawalsService.createWithdrawal(dbUser.id, createWithdrawalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user withdrawals' })
  async getWithdrawals(@CurrentUser() user: any) {
    const dbUser = await this.withdrawalsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.withdrawalsService.getWithdrawals(dbUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get withdrawal by ID' })
  getWithdrawal(@Param('id') id: string) {
    return this.withdrawalsService.getWithdrawal(id);
  }
}


