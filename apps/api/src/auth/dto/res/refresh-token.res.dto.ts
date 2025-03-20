import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      email: 'test@example.com',
      role: 'Owner',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  })
  data: {
    id: number;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
}
