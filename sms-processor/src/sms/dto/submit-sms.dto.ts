import { IsString, IsDateString, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSmsDto {
  @ApiProperty()
  @IsString()
  messageId: string;

  @ApiProperty()
  @IsString()
  rawText: string;

  @ApiProperty()
  @IsDateString()
  timestamp: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class BatchSubmitSmsDto {
  @ApiProperty({ type: [SubmitSmsDto] })
  @IsArray()
  messages: SubmitSmsDto[];
}


