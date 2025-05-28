import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('kyc')
@Controller('kyc')
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC documents' })
  async submitKyc(@CurrentUser() user: any, @Body() submitKycDto: SubmitKycDto) {
    const dbUser = await this.kycService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.kycService.submitKyc(dbUser.id, submitKycDto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get KYC status' })
  async getStatus(@CurrentUser() user: any) {
    const dbUser = await this.kycService['prisma'].user.findUnique({
      where: { firebaseUid: user.uid },
    });
    return this.kycService.getKycStatus(dbUser.id);
  }
}

