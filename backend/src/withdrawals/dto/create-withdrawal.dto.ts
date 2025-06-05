import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawalDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  bankDetails?: any;
}

