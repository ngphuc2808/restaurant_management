import { ApiProperty } from '@nestjs/swagger';

import { GuestType } from '@/guest/dto/types';

export class GuestResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Name',
      tableNumber: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
  data: GuestType;
}
