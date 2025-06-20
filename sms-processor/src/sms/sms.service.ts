import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SubmitSmsDto } from './dto/submit-sms.dto';

@Injectable()
export class SmsService {
  constructor(private prisma: PrismaService) {}

  async saveRawSms(userId: string, submitSmsDto: SubmitSmsDto) {
    try {
      return await this.prisma.rawSMS.create({
        data: {
          messageId: submitSmsDto.messageId,
          userId,
          rawText: submitSmsDto.rawText,
          timestamp: new Date(submitSmsDto.timestamp),
          source: submitSmsDto.source,
          metadata: submitSmsDto.metadata,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return null;
      }
      throw error;
    }
  }

  async batchSaveRawSms(userId: string, messages: SubmitSmsDto[]) {
    const results = [];
    for (const message of messages) {
      const result = await this.saveRawSms(userId, message);
      results.push(result);
    }
    return results;
  }

  async getRawSms(userId: string, limit = 100) {
    return this.prisma.rawSMS.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}


