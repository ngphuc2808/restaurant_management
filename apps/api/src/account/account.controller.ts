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
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { CreateAccountResDto } from '@/account/dto/res/create.res.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: MeResDto })
  @Get('me')
  me(@User() user: UserDto) {
    return this.accountService.me(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create')
  @ApiOkResponse({ type: CreateAccountResDto })
  @Post()
  create(@Body() createAccountDto: CreateAccountReqDto) {
    return this.accountService.create(createAccountDto);
  }
}
