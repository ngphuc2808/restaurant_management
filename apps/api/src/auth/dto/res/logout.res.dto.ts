import { ApiProperty } from '@nestjs/swagger';

export class LogoutResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;
}
