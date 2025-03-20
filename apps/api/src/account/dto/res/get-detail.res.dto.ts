import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from '@/account/dto/types';

export class AccountResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Name',
      email: 'test@example.com',
      role: 'Owner',
      avatar: '',
      ownerId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
  data: AccountType;
}
