import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordReqDto {
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

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  oldPassword: string;
}
