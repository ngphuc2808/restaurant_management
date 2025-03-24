import { IsNumber, IsPositive, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { TableStatus } from '@/constants/type';

export class CreateTableReqDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  number: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  capacity: number;

  @IsEnum([TableStatus.Available, TableStatus.Hidden, TableStatus.Reserved])
  @ApiProperty()
  status: string;
}
