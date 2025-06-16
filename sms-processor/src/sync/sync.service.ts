import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async getLastSyncTimestamp(userId: string): Promise<Date | null> {
    const lastSms = await this.prisma.rawSMS.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    return lastSms?.timestamp || null;
  }

  async syncIncremental(userId: string, since?: Date) {
    const where: any = { userId };
    if (since) {
      where.timestamp = { gt: since };
    }

    const newSms = await this.prisma.rawSMS.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    return newSms;
  }

  async checkDuplicates(userId: string, messageIds: string[]) {
    const existing = await this.prisma.rawSMS.findMany({
      where: {
        userId,
        messageId: { in: messageIds },
      },
      select: { messageId: true },
    });

    const existingIds = new Set(existing.map((e) => e.messageId));
    return messageIds.filter((id) => !existingIds.has(id));
  }
}

