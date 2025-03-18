import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from '@/account/dto/types';

export class GetAccountListResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      accounts: [
        {
          role: 'Employee',
          id: 1,
          name: 'Nhan vien',
          email: 'email@test.com',
          avatar: '',
          ownerId: 1,
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
    accounts: AccountType[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
