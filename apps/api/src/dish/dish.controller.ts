import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { DishService } from '@/dish/dish.service';
import { ResponseMessage, Role } from '@/constants/type';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Public, Roles } from '@/auth/decorators/public.decorator';

import { CreateDishReqDto } from '@/dish/dto/req/create.req.dto';
import { DishResDto } from '@/dish/dto/res/dish.res.dto';
import { UpdateDishReqDto } from '@/dish/dto/req/update.req.dto';
import { GetDishesListResDto } from '@/dish/dto/res/get-list.res.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';

@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.dish.get')
  @ApiOkResponse({ type: DishResDto })
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return await this.dishService.getDetail(Number(id));
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.dish.get-list')
  @ApiOkResponse({ type: GetDishesListResDto })
  @Get()
  async getList(@Query() paginationDto: PaginationReqDto) {
    return await this.dishService.getList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.dish.create')
  @ApiOkResponse({ type: DishResDto })
  @Post()
  async create(@Body() createDishDto: CreateDishReqDto) {
    return await this.dishService.create(createDishDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.dish.update')
  @ApiOkResponse({ type: DishResDto })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishReqDto,
  ) {
    return await this.dishService.update(Number(id), updateDishDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.dish.delete')
  @ApiOkResponse({ type: DishResDto })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.dishService.delete(Number(id));
  }
}
