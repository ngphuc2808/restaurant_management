import { PartialType } from '@nestjs/mapped-types';

import { CreateTableDto } from '@/table/dto/create-table.dto';

export class UpdateTableDto extends PartialType(CreateTableDto) {}
