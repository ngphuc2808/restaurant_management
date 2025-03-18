import { ApiProperty } from '@nestjs/swagger';

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
    },
  })
  data: {
    role: string;
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    ownerId: number | null;
  };
}
