import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitKycDto {
  @ApiProperty()
  @IsObject()
  documents: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  verificationData?: any;
}

