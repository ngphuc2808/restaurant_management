import { Injectable } from '@nestjs/common';

import { CreateTableDto } from '@/table/dto/create-table.dto';
import { UpdateTableDto } from '@/table/dto/update-table.dto';

@Injectable()
export class TableService {
  create(createTableDto: CreateTableDto) {
    return 'This action adds a new table';
  }

  findAll() {
    return `This action returns all table`;
  }

  findOne(id: number) {
    return `This action returns a #${id} table`;
  }

  update(id: number, updateTableDto: UpdateTableDto) {
    return `This action updates a #${id} table`;
  }

  remove(id: number) {
    return `This action removes a #${id} table`;
  }
}
