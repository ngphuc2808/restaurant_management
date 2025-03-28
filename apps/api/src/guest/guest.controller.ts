import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { GuestService } from '@/guest/guest.service';
import { Public, Roles } from '@/auth/decorators/public.decorator';
import { ResponseMessage, Role, User } from '@/constants/type';
import { ApiOkResponse } from '@nestjs/swagger';

import { RoleGuard } from '@/auth/guards/role.guard';
import { UserDto } from '@/auth/dto/types';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestLoginResDto } from '@/guest/dto/res/guest-login.res.dto';
import { GuestLogoutResDto } from '@/guest/dto/res/guest-logout.res.dto';
import { GuestLogoutReqDto } from '@/guest/dto/req/guest-logout.req.dto';
import { GuestRefreshTokenResDto } from '@/guest/dto/res/guest-refresh-token.res.dto';
import { GuestRefreshTokenReqDto } from '@/guest/dto/req/guest-refresh-token.req.dto';
import { GuestCreateDishReqDto } from '@/guest/dto/req/guest-create-dish.req.dto';
import { GuestCreateDishResDto } from '@/guest/dto/res/guest-create-dish.res.dto';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.login')
  @ApiOkResponse({ type: GuestLoginResDto })
  @Post('auth/login')
  async login(@Body() loginDto: GuestLoginReqDto) {
    return await this.guestService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.logout')
  @ApiOkResponse({ type: GuestLogoutResDto })
  @Post('auth/logout')
  async logout(@Body() logoutDto: GuestLogoutReqDto) {
    await this.guestService.logout(logoutDto.id);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.refresh-token')
  @ApiOkResponse({ type: GuestRefreshTokenResDto })
  @Post('auth/refresh-token')
  async refresh(@Body() tokenDto: GuestRefreshTokenReqDto) {
    return await this.guestService.processNewGuestToken(tokenDto.refreshToken);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Guest])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.create')
  @ApiOkResponse({ type: GuestCreateDishResDto })
  @Post('orders')
  async create(
    @User() user: UserDto,
    @Body() createDishDto: GuestCreateDishReqDto[],
  ) {
    return await this.guestService.createDish(user.id, createDishDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Guest])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.order.get-list')
  @ApiOkResponse({ type: GuestCreateDishResDto })
  @Get('orders')
  async getList(@User() user: UserDto) {
    return await this.guestService.getListOrder(user.id);
  }
}
