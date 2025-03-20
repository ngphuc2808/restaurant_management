import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class UpdateMeReqDto {
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  @ApiProperty()
  name: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  @ApiProperty()
  avatar: string;
}
