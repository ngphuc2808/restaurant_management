import { ApiProperty } from '@nestjs/swagger';

import { TableType } from '@/table/dto/types';

export class TableResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      number: 1,
      capacity: 2,
      status: 'Available',
      token: '1234567890',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
  data: TableType;
}
