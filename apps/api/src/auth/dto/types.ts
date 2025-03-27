import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { Role } from '@/constants/type';

export class UserDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsEnum([Role.Owner, Role.Employee, Role.Guest])
  role?: string;
}

export class GoogleUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  accessToken?: string;

  @IsString()
  refreshToken?: string;
}
