import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      account: {
        id: 1,
        name: 'Phúc Admin 2',
        email: 'test@example.com',
        role: 'Owner',
        avatar:
          'https://phucnh-restaurant-management.s3.amazonaws.com/employees/64d63761-586e-4813-b8a6-680838f86556-pexels-frank-cone-140140-31190087.jpg',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  })
  data: {
    account: {
      id: number;
      name: string;
      email: string;
      role: string;
      avatar: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}
