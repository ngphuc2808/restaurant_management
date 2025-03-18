import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenReqDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}
