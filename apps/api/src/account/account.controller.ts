import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { AccountService } from '@/account/account.service';
import { ResponseMessage, Role, User } from '@/constants/type';
import { UserDto } from '@/auth/dto/account.dto';

import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { AccountResDto } from '@/account/dto/res/get-detail.res.dto';
import { PaginationReqDto } from '@/account/dto/req/paginate.req.dto';
import { GetAccountListResDto } from '@/account/dto/res/get-list.res.dto';
import { UpdateMeReqDto } from '@/account/dto/req/update-me.req.dto';
import { ChangePasswordReqDto } from '@/account/dto/req/change-password.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { DeleteAccountResDto } from '@/account/dto/res/delete.res.dto';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/public.decorator';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: AccountResDto })
  @Get('me')
  me(@User() user: UserDto) {
    return this.accountService.me(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update')
  @ApiOkResponse({ type: AccountResDto })
  @Put('me')
  updateMe(@User() user: UserDto, @Body() updateMeDto: UpdateMeReqDto) {
    return this.accountService.updateMe(user.id, updateMeDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update-password')
  @ApiOkResponse({ type: AccountResDto })
  @Put('change-password')
  updatePassword(
    @User() user: UserDto,
    @Body() changePasswordReqDto: ChangePasswordReqDto,
  ) {
    return this.accountService.updatePassword(user.id, changePasswordReqDto);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-list')
  @ApiOkResponse({ type: GetAccountListResDto })
  @Get()
  getAccountList(@Query() paginationDto: PaginationReqDto) {
    return this.accountService.getAccountList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: AccountResDto })
  @Get('detail/:id')
  getAccountDetail(@Param('id') id: string) {
    return this.accountService.getAccountDetail(Number(id));
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create')
  @ApiOkResponse({ type: AccountResDto })
  @Post()
  create(@Body() createAccountDto: CreateAccountReqDto) {
    return this.accountService.create(createAccountDto);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update')
  @ApiOkResponse({ type: AccountResDto })
  @Put('detail/:id')
  updateAccount(
    @Param('id') id: string,
    @Body() updateMeDto: UpdateAccountReqDto,
  ) {
    return this.accountService.updateAccount(Number(id), updateMeDto);
  }

  @UseGuards(RoleGuard)
  @Roles(Role.Owner)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.delete')
  @ApiOkResponse({ type: DeleteAccountResDto })
  @Delete('detail/:id')
  deleteAccount(@Param('id') id: string) {
    return this.accountService.deleteAccount(Number(id));
  }
}
