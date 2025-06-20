import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SubmitSmsDto, BatchSubmitSmsDto } from './dto/submit-sms.dto';
import { ParserService } from '../parser/parser.service';
import { SyncService } from '../sync/sync.service';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly parserService: ParserService,
    private readonly syncService: SyncService,
  ) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Submit SMS' })
  async submitSms(@Param('userId') userId: string, @Body() submitSmsDto: SubmitSmsDto) {
    const rawSms = await this.smsService.saveRawSms(userId, submitSmsDto);
    if (rawSms) {
      await this.parserService.processSms(rawSms.id, userId, submitSmsDto.rawText);
    }
    return { success: true, id: rawSms?.id };
  }

  @Post(':userId/batch')
  @ApiOperation({ summary: 'Batch submit SMS' })
  async batchSubmitSms(
    @Param('userId') userId: string,
    @Body() batchDto: BatchSubmitSmsDto,
  ) {
    const results = await this.smsService.batchSaveRawSms(userId, batchDto.messages);
    const processed = results.filter((r) => r !== null);
    for (const rawSms of processed) {
      if (rawSms) {
        await this.parserService.processSms(rawSms.id, userId, rawSms.rawText);
      }
    }
    return { success: true, processed: processed.length, total: batchDto.messages.length };
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get raw SMS' })
  getRawSms(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.smsService.getRawSms(userId, limit);
  }
}


