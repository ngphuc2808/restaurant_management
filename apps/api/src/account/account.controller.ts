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
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { AccountService } from '@/account/account.service';
import { ResponseMessage, Role, User } from '@/constants/type';
import { UserDto } from '@/auth/dto/account.dto';

import { MeResDto } from '@/account/dto/res/me.res.dto';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { CreateAccountResDto } from '@/account/dto/res/create.res.dto';
import { GetDetailAccountResDto } from '@/account/dto/res/get-detail.res.dto';
import { PaginationReqDto } from '@/account/dto/req/paginate.req.dto';
import { GetAccountListResDto } from '@/account/dto/res/get-list.res.dto';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/public.decorator';

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

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-all')
  @ApiOkResponse({ type: GetAccountListResDto })
  @Get()
  getAccountList(@Query() paginationDto: PaginationReqDto) {
    return this.accountService.getAccountList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create')
  @ApiOkResponse({ type: CreateAccountResDto })
  @Post()
  create(@Body() createAccountDto: CreateAccountReqDto) {
    return this.accountService.create(createAccountDto);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: GetDetailAccountResDto })
  @Get('detail/:id')
  getAccountDetail(@Param('id') id: string) {
    return this.accountService.getAccountDetail(Number(id));
  }
}
