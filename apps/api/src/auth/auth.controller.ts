import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { GoogleAuthGuard } from '@/auth/guards/google-auth.guard';
import { AuthService } from '@/auth/auth.service';
import { Public } from '@/auth/decorators/public.decorator';
import { ResponseMessage } from '@/constants/type';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { LogoutReqDto } from '@/auth/dto/req/logout.req.dto';
import { RefreshTokenReqDto } from '@/auth/dto/req/refresh-token.req.dto';
import { LoginResDto } from '@/auth/dto/res/login.res.dto';
import { LogoutResDto } from '@/auth/dto/res/logout.res.dto';
import { RefreshTokenResDto } from '@/auth/dto/res/refresh-token.res.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.login')
  @ApiOkResponse({ type: LoginResDto })
  @Post('login')
  async login(@Body() loginDto: LoginReqDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Public()
  @Get('login/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    await this.authService.loginGoogle(req.user, res);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.logout')
  @ApiOkResponse({ type: LogoutResDto })
  @Post('logout')
  async logout(@Body() logoutDto: LogoutReqDto) {
    await this.authService.logout(logoutDto.refreshToken);
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
