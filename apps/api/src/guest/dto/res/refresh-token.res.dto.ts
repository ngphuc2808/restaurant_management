import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  })
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
