import { Module } from '@nestjs/common';
import { GoldService } from './gold.service';
import { GoldController } from './gold.controller';
import { GoldProviderService } from './services/gold-provider.service';

@Module({
  controllers: [GoldController],
  providers: [GoldService, GoldProviderService],
  exports: [GoldService, GoldProviderService],
})
export class GoldModule {}


