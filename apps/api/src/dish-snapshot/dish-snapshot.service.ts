import { Injectable } from '@nestjs/common';

import { CreateDishSnapshotDto } from '@/dish-snapshot/dto/create-dish-snapshot.dto';
import { UpdateDishSnapshotDto } from '@/dish-snapshot/dto/update-dish-snapshot.dto';

@Injectable()
export class DishSnapshotService {
  create(createDishSnapshotDto: CreateDishSnapshotDto) {
    return 'This action adds a new dishSnapshot';
  }

  findAll() {
    return `This action returns all dishSnapshot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dishSnapshot`;
  }

  update(id: number, updateDishSnapshotDto: UpdateDishSnapshotDto) {
    return `This action updates a #${id} dishSnapshot`;
  }

  remove(id: number) {
    return `This action removes a #${id} dishSnapshot`;
  }
}
