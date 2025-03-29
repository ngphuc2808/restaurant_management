import { IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@/constants/type';

export class UpdateOrderReqDto {
  @IsEnum([
    OrderStatus.Delivered,
    OrderStatus.Pending,
    OrderStatus.Paid,
    OrderStatus.Processing,
    OrderStatus.Rejected,
  ])
  @ApiProperty()
  status: string;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  dishId: number;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;
}
