import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

import { Role } from '@/constants/type';

export class UserDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsEnum([Role.Owner, Role.Employee])
  role?: string;
}
