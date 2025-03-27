import { ApiProperty } from '@nestjs/swagger';

import { TableType } from '../types';

export class GetTablesListResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      tables: [
        {
          number: 1,
          capacity: 2,
          status: 'Available',
          token: '1234567890',
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
    tables: TableType[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
