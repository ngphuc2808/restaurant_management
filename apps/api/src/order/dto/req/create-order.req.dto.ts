import { IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @IsNumber()
  @Min(1)
  @ApiProperty()
  dishId: number;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  quantity: number;
}

export class CreateOrderReqDto {
  @IsNumber()
  @Min(1)
  @ApiProperty()
  guestId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({ type: [OrderItemDto] })
  orders: OrderItemDto[];
}
