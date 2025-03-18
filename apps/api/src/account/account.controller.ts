import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { AccountService } from '@/account/account.service';
import { ResponseMessage, User } from '@/constants/type';
import { UserDto } from '@/auth/dto/account.dto';

import { MeResDto } from '@/account/dto/res/me.res.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: MeResDto })
  @Get('me')
  create(@User() user: UserDto) {
    return this.accountService.me(user.id);
  }
}
