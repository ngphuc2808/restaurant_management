import { ApiProperty } from '@nestjs/swagger';

import { GuestType } from '@/guest/dto/types';

export class GuestLoginResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      guest: {
        id: 1,
        name: 'John Doe',
        role: 'Guest',
        tableNumber: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  })
  data: {
    guest: GuestType;
    accessToken: string;
    refreshToken: string;
  };
}
