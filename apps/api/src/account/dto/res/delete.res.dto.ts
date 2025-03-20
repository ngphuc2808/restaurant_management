import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;
}
