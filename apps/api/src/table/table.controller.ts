import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  HttpStatus,
  Get,
  Query,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { TableService } from '@/table/table.service';
import { ResponseMessage, Role } from '@/constants/type';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Public, Roles } from '@/auth/decorators/public.decorator';

import { CreateTableReqDto } from '@/table/dto/req/create.req.dto';
import { UpdateTableReqDto } from '@/table/dto/req/update.req.dto';
import { TableResDto } from '@/table/dto/res/table.res.dto';
import { GetTablesListResDto } from '@/table/dto/res/get-list.res.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.dish.get')
  @ApiOkResponse({ type: TableResDto })
  @Get(':number')
  async getDetail(@Param('number') number: string) {
    return await this.tableService.getDetail(Number(number));
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-list')
  @ApiOkResponse({ type: GetTablesListResDto })
  @Get()
  async getAccountList(@Query() paginationDto: PaginationReqDto) {
    return await this.tableService.getTableList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.table.create')
  @ApiOkResponse({ type: TableResDto })
  @Post()
  async create(@Body() createTableDto: CreateTableReqDto) {
    return await this.tableService.create(createTableDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.table.update')
  @ApiOkResponse({ type: TableResDto })
  @Put(':number')
  async update(
    @Param('number') number: string,
    @Body() updateTableDto: UpdateTableReqDto,
  ) {
    return await this.tableService.update(Number(number), updateTableDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.table.delete')
  @ApiOkResponse({ type: TableResDto })
  @Delete(':number')
  async delete(@Param('number') number: string) {
    return await this.tableService.delete(Number(number));
  }
}
