import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { ParserModule } from '../parser/parser.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [ParserModule, SyncModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}


