import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('buy')
  @ApiOperation({ summary: 'Buy gold' })
  async buyGold(@CurrentUser() user: any, @Body() createTransactionDto: CreateTransactionDto) {
    const dbUser = await this.transactionsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.transactionsService.buyGold(dbUser.id, createTransactionDto);
  }

  @Post('sell')
  @ApiOperation({ summary: 'Sell gold' })
  async sellGold(@CurrentUser() user: any, @Body() createTransactionDto: CreateTransactionDto) {
    const dbUser = await this.transactionsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.transactionsService.sellGold(dbUser.id, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get transaction history' })
  async getHistory(@CurrentUser() user: any, @Query('limit') limit?: number) {
    const dbUser = await this.transactionsService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.transactionsService.getTransactionHistory(dbUser.id, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  getTransaction(@Param('id') id: string) {
    return this.transactionsService.getTransaction(id);
  }
}


