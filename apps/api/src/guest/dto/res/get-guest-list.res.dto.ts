import { ApiProperty } from '@nestjs/swagger';

import { GuestType } from '@/guest/dto/types';

export class GetGuestListResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      guests: [
        {
          id: 1,
          name: 'Guest',
          tableNumber: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  data: {
    guests: GuestType[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
