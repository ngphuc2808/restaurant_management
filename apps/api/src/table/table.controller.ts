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
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { TableService } from '@/table/table.service';
import { ResponseMessage, Role } from '@/constants/type';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Public, Roles } from '@/auth/decorators/public.decorator';

import { CreateTableReqDto } from '@/table/dto/req/create.req.dto';
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
  getDetail(@Param('number') number: string) {
    return this.tableService.getDetail(Number(number));
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-list')
  @ApiOkResponse({ type: GetTablesListResDto })
  @Get()
  getAccountList(@Query() paginationDto: PaginationReqDto) {
    return this.tableService.getTableList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.table.create')
  @ApiOkResponse({ type: TableResDto })
  @Post()
  create(@Body() createTableDto: CreateTableReqDto) {
    return this.tableService.create(createTableDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.table.delete')
  @ApiOkResponse({ type: TableResDto })
  @Delete(':number')
  delete(@Param('number') number: string) {
    return this.tableService.delete(Number(number));
  }
}
