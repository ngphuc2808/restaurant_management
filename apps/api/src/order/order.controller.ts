import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';

import { OrderService } from '@/order/order.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/public.decorator';
import { ResponseMessage, Role } from '@/constants/type';
import { ApiOkResponse } from '@nestjs/swagger';
import { GetOrdersListResDto } from '@/order/dto/res/get-list.res.dto';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';

@Controller('orders')
@UseGuards(RoleGuard)
@Roles([Role.Guest])
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.get-list')
  @ApiOkResponse({ type: GetOrdersListResDto })
  @Get()
  getListOrder(
    @Query()
    getListOrderDto: PaginationTimeReqDto,
  ) {
    return this.orderService.getListOrder(getListOrderDto);
  }
}
