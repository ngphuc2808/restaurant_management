import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      email: 'email@test.com',
      role: 'Employee',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  })
  data: {
    id: number;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
}
