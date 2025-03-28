import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationTimeReqDto {
  @IsString()
  @IsDateString()
  @ApiProperty()
  fromDate?: Date | undefined;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  toDate?: Date | undefined;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty()
  limit?: number = 10;
}
