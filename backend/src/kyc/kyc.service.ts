import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { RabbitMQService } from '../common/rabbitmq/rabbitmq.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';

@Injectable()
export class KycService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private rabbitMQ: RabbitMQService,
  ) {}

  async submitKyc(userId: string, submitKycDto: SubmitKycDto) {
    const kyc = await this.prisma.kYC.upsert({
      where: { userId },
      update: {
        status: 'PENDING',
        documents: submitKycDto.documents,
        verificationData: submitKycDto.verificationData,
        submittedAt: new Date(),
      },
      create: {
        userId,
        status: 'PENDING',
        documents: submitKycDto.documents,
        verificationData: submitKycDto.verificationData,
        submittedAt: new Date(),
      },
    });

    await this.redis.del(`kyc:${userId}`);
    await this.rabbitMQ.publish('kyc.events', 'kyc.submitted', {
      userId,
      kycId: kyc.id,
      status: kyc.status,
    });

    return kyc;
  }

  async getKycStatus(userId: string) {
    const cacheKey = `kyc:${userId}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) {
      return cached;
    }

    const kyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    await this.redis.setJSON(cacheKey, kyc, 600);
    return kyc;
  }

  async updateKycStatus(userId: string, status: string, rejectionReason?: string) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date();
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }

    const kyc = await this.prisma.kYC.update({
      where: { userId },
      data: updateData,
    });

    await this.redis.del(`kyc:${userId}`);
    await this.rabbitMQ.publish('kyc.events', `kyc.${status.toLowerCase()}`, {
      userId,
      kycId: kyc.id,
      status: kyc.status,
    });

    return kyc;
  }
}

