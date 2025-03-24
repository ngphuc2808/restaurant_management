import { ApiProperty } from '@nestjs/swagger';

import { DishType } from '@/dish/dto/types';

export class GetDishesListResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      dishes: [
        {
          id: 1,
          name: 'Bánh mì',
          price: 30000,
          description: 'Bánh mì Việt Nam',
          image: '',
          status: 'Available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  data: {
    dishes: DishType[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
