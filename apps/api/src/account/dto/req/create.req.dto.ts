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
  name: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatar: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  confirmPassword: string;
}
