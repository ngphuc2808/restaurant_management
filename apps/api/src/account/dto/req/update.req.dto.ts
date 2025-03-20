import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@/constants/type';

export class UpdateAccountReqDto {
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

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsEnum([Role.Owner, Role.Employee])
  @ApiProperty()
  role: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  changePassword: boolean;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  confirmPassword: string;
}
