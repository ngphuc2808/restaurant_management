import { ApiProperty } from '@nestjs/swagger';

import { DishType } from '@/dish/dto/types';

export class DishResDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Hamburgur',
      image: '',
      price: 50000,
      status: 'Available',
      description: 'Hamburger chicken',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
  data: DishType;
}
