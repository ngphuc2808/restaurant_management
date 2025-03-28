import { ApiProperty } from '@nestjs/swagger';

import { IndicatorType } from '@/indicator/dto/types';

export class IndicatorResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      revenue: 1000000,
      guestCount: 10,
      orderCount: 15,
      servingTableCount: 5,
      dishIndicator: [
        {
          id: 1,
          name: 'Test Dish',
          price: 10000,
          description: 'Test Description',
          image: '',
          status: 'Available',
          successOrders: 5,
        },
      ],
      revenueByDate: [
        {
          date: '2024-03-28',
          revenue: 500000,
        },
      ],
    },
  })
  data: IndicatorType;
}
