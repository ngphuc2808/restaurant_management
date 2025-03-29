import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/public.decorator';
import { OrderService } from '@/order/order.service';
import { GetOrdersListResDto } from '@/order/dto/res/get-list.res.dto';
import { OrderResDto } from '@/order/dto/res/order-detail.res.dto';
import { CreateOrderReqDto } from '@/order/dto/req/create-order.req.dto';
import { CreateOrderResDto } from '@/order/dto/res/create-order.res.dto';
import { UpdateOrderReqDto } from '@/order/dto/req/update-order.req.dto';
import { UpdateOrderResDto } from '@/order/dto/res/update-order.res.dto';
import { PayOrderReqDto } from '@/order/dto/req/pay-order.req.dto';
import { PayOrderResDto } from '@/order/dto/res/pay-order.res.dto';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';
import { ResponseMessage, Role, User } from '@/constants/type';
import { UserDto } from '@/auth/dto/types';

@UseGuards(RoleGuard)
@Roles([Role.Owner, Role.Employee])
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.get-list')
  @ApiOkResponse({ type: GetOrdersListResDto })
  @Get()
  async getListOrder(
    @Query()
    getListOrderDto: PaginationTimeReqDto,
  ) {
    return await this.orderService.getListOrder(getListOrderDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.get')
  @ApiOkResponse({ type: OrderResDto })
  @Get(':orderId')
  async getOrder(
    @Param('orderId')
    orderId: string,
  ) {
    return await this.orderService.getOrder(Number(orderId));
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.create')
  @ApiOkResponse({ type: CreateOrderResDto })
  @Post()
  async createOrder(
    @User()
    user: UserDto,
    @Body()
    createOrderDto: CreateOrderReqDto,
  ) {
    return await this.orderService.createOrder(user.id, createOrderDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.update')
  @ApiOkResponse({ type: UpdateOrderResDto })
  @Put(':orderId')
  async updateOrder(
    @Param('orderId')
    orderId: string,
    @User()
    user: UserDto,
    @Body() updateOrderDto: UpdateOrderReqDto,
  ) {
    return await this.orderService.updateOrder(
      Number(orderId),
      user.id,
      updateOrderDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.pay')
  @ApiOkResponse({ type: PayOrderResDto })
  @Post('pay')
  async payOrder(
    @User()
    user: UserDto,
    @Body()
    payOrderDto: PayOrderReqDto,
  ) {
    return await this.orderService.payOrder(user.id, payOrderDto.guestId);
  }
}
