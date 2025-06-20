import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    const dbStatus = await this.checkDatabase();
    const cacheStatus = await this.checkCache();

    return {
      status: dbStatus && cacheStatus ? 'healthy' : 'unhealthy',
      database: dbStatus ? 'connected' : 'disconnected',
      cache: cacheStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkCache(): Promise<boolean> {
    try {
      await this.redis.get('health-check');
      return true;
    } catch {
      return false;
    }
  }
}


