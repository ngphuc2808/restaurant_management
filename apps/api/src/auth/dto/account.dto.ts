import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

import { Role } from '@/constants/type';

export class UserDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum([Role.Owner, Role.Employee])
  @IsOptional()
  role?: string;
}
