import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoldService } from './gold.service';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('gold')
@Controller('gold')
@ApiBearerAuth()
export class GoldController {
  constructor(private readonly goldService: GoldService) {}

  @Get('price')
  @ApiOperation({ summary: 'Get current gold price' })
  getPrice() {
    return this.goldService.getCurrentPrice();
  }

  @Get('holdings')
  @ApiOperation({ summary: 'Get user gold holdings' })
  async getHoldings(@CurrentUser() user: any) {
    const dbUser = await this.goldService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.goldService.getHoldings(dbUser.id);
  }
}

