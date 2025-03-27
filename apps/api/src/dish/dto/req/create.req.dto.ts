import {
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { DishStatus } from '@/constants/type';

export class CreateDishReqDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  @ApiProperty()
  description: string;

  @IsString()
  @IsUrl({ require_tld: false })
  @ApiProperty()
  image: string;

  @IsEnum([DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden])
  @ApiProperty()
  status: string;
}
