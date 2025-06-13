import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class ParserService {
  private patterns: Map<string, RegExp[]> = new Map();

  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {
    this.initializePatterns();
  }

  private initializePatterns() {
    this.patterns.set('BANKING', [
      /debited|credited|balance|account/i,
      /INR\s*[\d,]+\.?\d*/i,
      /Acct\s*[\dX]+/i,
    ]);
    this.patterns.set('TRANSACTION', [
      /paid|received|payment|transaction/i,
      /INR\s*[\d,]+\.?\d*/i,
      /to\s+[\w\s]+/i,
    ]);
    this.patterns.set('OTP', [/OTP|verification|code|[\d]{4,6}/i]);
    this.patterns.set('PROMOTIONAL', [/offer|discount|sale|promo/i]);
  }

  async processSms(rawSmsId: string, userId: string, rawText: string) {
    const category = this.categorize(rawText);
    const parsedData = this.extractData(rawText, category);
    const confidence = this.calculateConfidence(rawText, category);

    const processed = await this.prisma.processedSMS.upsert({
      where: {
        messageId_userId: {
          messageId: rawSmsId,
          userId,
        },
      },
      update: {
        rawText,
        parsedData,
        category,
        confidence,
        processedAt: new Date(),
      },
      create: {
        messageId: rawSmsId,
        userId,
        rawText,
        parsedData,
        category,
        confidence,
      },
    });

    await this.eventsService.publishProcessedSms({
      userId,
      messageId: rawSmsId,
      category: category || 'UNKNOWN',
      parsedData,
      timestamp: new Date().toISOString(),
    });

    return processed;
  }

  private categorize(text: string): string | null {
    let maxMatches = 0;
    let bestCategory: string | null = null;

    for (const [category, patterns] of this.patterns.entries()) {
      const matches = patterns.filter((pattern) => pattern.test(text)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  private extractData(text: string, category: string | null): any {
    const data: any = {};

    const amountMatch = text.match(/INR\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      data.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    if (dateMatch) {
      data.date = dateMatch[1];
    }

    const accountMatch = text.match(/Acct\s*([\dX]+)/i);
    if (accountMatch) {
      data.account = accountMatch[1];
    }

    const merchantMatch = text.match(/to\s+([A-Za-z\s]+)/i);
    if (merchantMatch) {
      data.merchant = merchantMatch[1].trim();
    }

    return data;
  }

  private calculateConfidence(text: string, category: string | null): number {
    if (!category) return 0;

    const patterns = this.patterns.get(category) || [];
    const matches = patterns.filter((pattern) => pattern.test(text)).length;
    return Math.min((matches / patterns.length) * 100, 100);
  }
}

