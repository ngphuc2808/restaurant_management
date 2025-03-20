import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { AuthService } from '@/auth/auth.service';
import { Public } from '@/auth/decorators/public.decorator';
import { ResponseMessage } from '@/constants/type';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { LogoutReqDto } from '@/auth/dto/req/logout.req.dto';
import { RefreshTokenReqDto } from '@/auth/dto/req/refresh-token.req.dto';
import { LoginResDto } from '@/auth/dto/res/login.res.dto';
import { LogoutResDto } from '@/auth/dto/res/logout.res.dto';
import { RefreshTokenResDto } from '@/auth/dto/res/refresh-token.res.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.login')
  @ApiOkResponse({ type: LoginResDto })
  @Post('login')
  async login(@Body() loginDto: LoginReqDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.logout')
  @ApiOkResponse({ type: LogoutResDto })
  @Post('logout')
  async logout(@Body() tokenDto: LogoutReqDto) {
    await this.authService.logout(tokenDto.refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.refresh-token')
  @ApiOkResponse({ type: RefreshTokenResDto })
  @Post('refresh-token')
  async refresh(@Body() tokenDto: RefreshTokenReqDto) {
    return this.authService.processNewToken(tokenDto.refreshToken);
  }
}
