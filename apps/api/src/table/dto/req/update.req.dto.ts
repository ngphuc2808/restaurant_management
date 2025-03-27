import { IsNumber, IsPositive, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { TableStatus } from '@/constants/type';

export class UpdateTableReqDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  capacity: number;

  @IsEnum([TableStatus.Available, TableStatus.Hidden, TableStatus.Reserved])
  @ApiProperty()
  status: string;

  @IsBoolean()
  @ApiProperty()
  changeToken: boolean;
}
