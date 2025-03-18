import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from '@/account/dto/types';

export class CreateAccountResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      role: 'Employee',
      id: 1,
      name: 'Nhan vien',
      email: 'email@test.com',
      avatar: '',
      ownerId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
  data: AccountType;
}
