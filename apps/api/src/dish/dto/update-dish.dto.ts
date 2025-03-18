import { PartialType } from '@nestjs/mapped-types';

import { CreateDishDto } from '@/dish/dto/create-dish.dto';

export class UpdateDishDto extends PartialType(CreateDishDto) {}
