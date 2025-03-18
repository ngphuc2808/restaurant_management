import { PartialType } from '@nestjs/mapped-types';

import { CreateDishSnapshotDto } from '@/dish-snapshot/dto/create-dish-snapshot.dto';

export class UpdateDishSnapshotDto extends PartialType(CreateDishSnapshotDto) {}
