import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayOrderReqDto {
  @IsNumber()
  @Min(1)
  @ApiProperty()
  orderId: number;
}
