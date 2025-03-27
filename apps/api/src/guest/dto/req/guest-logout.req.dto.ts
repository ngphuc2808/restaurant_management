import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GuestLogoutReqDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;
}
