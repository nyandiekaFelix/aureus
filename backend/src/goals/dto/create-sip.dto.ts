import { IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSipDto {
  @ApiProperty()
  @IsString()
  goalId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  frequency: string;

  @ApiProperty()
  @IsDateString()
  nextExecutionDate: string;
}


