import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenReqDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}
