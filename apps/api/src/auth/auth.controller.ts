// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { Account } from '@prisma/client';
import { AuthService } from '@/auth/auth.service';
import { Public } from '@/auth/decorators/public.decorator';
import { LocalAuthGuard } from '@/auth/guards/local-auth.guard';
import { RefreshTokenGuard } from '@/auth/guards/refresh-token.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LoginDto } from '@/auth/dto/login.dto';
import { TokenDto } from '@/auth/dto/token.dto';
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto';
import { AccountDto } from '@/auth/dto/account.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() accountDto: AccountDto) {
    return this.authService.createAccount(accountDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<TokenDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Request() req,
    @Body() tokenDto: RefreshTokenDto,
  ): Promise<TokenDto> {
    return this.authService.refreshAccessToken(tokenDto.refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() tokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(tokenDto.refreshToken);
  }
}
