import { ApiProperty } from '@nestjs/swagger';

export class GuestLogoutResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;
}
