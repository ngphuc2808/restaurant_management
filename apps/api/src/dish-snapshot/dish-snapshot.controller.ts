import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { DishSnapshotService } from '@/dish-snapshot/dish-snapshot.service';
import { CreateDishSnapshotDto } from '@/dish-snapshot/dto/create-dish-snapshot.dto';
import { UpdateDishSnapshotDto } from '@/dish-snapshot/dto/update-dish-snapshot.dto';

@Controller('dish-snapshot')
export class DishSnapshotController {
  constructor(private readonly dishSnapshotService: DishSnapshotService) {}

  @Post()
  create(@Body() createDishSnapshotDto: CreateDishSnapshotDto) {
    return this.dishSnapshotService.create(createDishSnapshotDto);
  }

  @Get()
  findAll() {
    return this.dishSnapshotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishSnapshotService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDishSnapshotDto: UpdateDishSnapshotDto,
  ) {
    return this.dishSnapshotService.update(+id, updateDishSnapshotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishSnapshotService.remove(+id);
  }
}
