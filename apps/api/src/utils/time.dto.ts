import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeReqDto {
  @IsString()
  @IsDateString()
  @ApiProperty()
  fromDate?: Date | undefined;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  toDate?: Date | undefined;
}
