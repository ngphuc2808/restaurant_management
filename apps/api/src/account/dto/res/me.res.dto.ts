import { ApiProperty } from '@nestjs/swagger';

export class MeResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Admin',
      email: 'admin@gmail.com',
      avatar: '',
      role: 'Admin',
    },
  })
  data: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
}
