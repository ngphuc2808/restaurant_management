import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { GuestService } from '@/guest/guest.service';
import { Public } from '@/auth/decorators/public.decorator';
import { ResponseMessage } from '@/constants/type';
import { ApiOkResponse } from '@nestjs/swagger';

import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestLoginResDto } from '@/guest/dto/res/guest-login.res.dto';
import { GuestLogoutResDto } from '@/guest/dto/res/guest-logout.res.dto';
import { GuestLogoutReqDto } from '@/guest/dto/req/guest-logout.req.dto';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.login')
  @ApiOkResponse({ type: GuestLoginResDto })
  @Post('auth/login')
  async login(@Body() loginDto: GuestLoginReqDto) {
    return this.guestService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.logout')
  @ApiOkResponse({ type: GuestLogoutResDto })
  @Post('auth/logout')
  async logout(@Body() logoutDto: GuestLogoutReqDto) {
    await this.guestService.logout(logoutDto.id);
  }
}
