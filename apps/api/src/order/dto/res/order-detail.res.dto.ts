import { ApiProperty } from '@nestjs/swagger';

import { OrderType } from '@/order/dto/types';
import { TableType } from '@/table/dto/types';

export class OrderResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      guestId: 1,
      tableNumber: 1,
      dishSnapshotId: 1,
      quantity: 1,
      orderHandlerId: null,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dishSnapshot: {
        id: 1,
        name: 'Bánh mì',
        price: 30000,
        description: 'Bánh mì Việt Nam',
        image: '',
        status: 'Available',
        dishId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      guest: {
        id: 1,
        name: 'Guest Name',
        tableNumber: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      table: {
        number: 1,
        capacity: 1,
        status: 'Available',
        token: 'token',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      orderHandler: null,
    },
  })
  data: OrderType & TableType;
}
