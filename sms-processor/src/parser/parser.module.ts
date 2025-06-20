import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [ParserService],
  exports: [ParserService],
})
export class ParserModule {}


