import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('ledger')
@Controller('ledger')
@ApiBearerAuth()
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'Get ledger accounts' })
  async getAccounts(@CurrentUser() user: any) {
    const dbUser = await this.ledgerService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.ledgerService.getAccounts(dbUser.id);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get ledger entries' })
  async getEntries(@CurrentUser() user: any, @Query('limit') limit?: number) {
    const dbUser = await this.ledgerService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.ledgerService.getLedgerEntries(dbUser.id, limit);
  }

  @Get('balance/:accountName')
  @ApiOperation({ summary: 'Get account balance' })
  async getBalance(@CurrentUser() user: any, @Param('accountName') accountName: string) {
    const dbUser = await this.ledgerService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return { balance: await this.ledgerService.getAccountBalance(dbUser.id, accountName) };
  }

  @Post('reconcile/:accountName')
  @ApiOperation({ summary: 'Reconcile account' })
  async reconcile(@CurrentUser() user: any, @Param('accountName') accountName: string) {
    const dbUser = await this.ledgerService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.ledgerService.reconcileAccount(dbUser.id, accountName);
  }
}


