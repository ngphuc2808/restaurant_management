import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountReqDto {
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @ApiProperty()
  avatar: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  confirmPassword: string;
}
