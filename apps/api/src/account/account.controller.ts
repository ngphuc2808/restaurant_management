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
import { GuestService } from '@/guest/guest.service';
import { ResponseMessage, Role, User } from '@/constants/type';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/public.decorator';

import { UserDto } from '@/auth/dto/types';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { AccountResDto } from '@/account/dto/res/account.res.dto';
import { GetAccountListResDto } from '@/account/dto/res/get-list.res.dto';
import { UpdateMeReqDto } from '@/account/dto/req/update-me.req.dto';
import { ChangePasswordReqDto } from '@/account/dto/req/change-password.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { GetGuestListResDto } from '@/guest/dto/res/get-guest-list.res.dto';
import { CreateGuestReqDto } from '@/guest/dto/req/create-guest.req.dto';
import { GuestResDto } from '@/guest/dto/res/guest.res.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly guestService: GuestService,
  ) {}

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
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-list')
  @ApiOkResponse({ type: GetAccountListResDto })
  @Get()
  getAccountList(@Query() paginationDto: PaginationReqDto) {
    return this.accountService.getAccountList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: AccountResDto })
  @Get('detail/:id')
  getAccountDetail(@Param('id') id: string) {
    return this.accountService.getAccountDetail(Number(id));
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create')
  @ApiOkResponse({ type: AccountResDto })
  @Post()
  create(@User() user: UserDto, @Body() createAccountDto: CreateAccountReqDto) {
    return this.accountService.create(user.id, createAccountDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update')
  @ApiOkResponse({ type: AccountResDto })
  @Put('detail/:id')
  updateAccount(
    @User() user: UserDto,
    @Param('id') id: string,
    @Body() updateMeDto: UpdateAccountReqDto,
  ) {
    return this.accountService.updateAccount(user.id, Number(id), updateMeDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.delete')
  @ApiOkResponse({ type: AccountResDto })
  @Delete('detail/:id')
  deleteAccount(@Param('id') id: string) {
    return this.accountService.deleteAccount(Number(id));
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-guest-list')
  @ApiOkResponse({ type: GetGuestListResDto })
  @Get('guests')
  getListGuest(
    @Query()
    getListGuestDto: PaginationTimeReqDto,
  ) {
    return this.guestService.getGuestList(getListGuestDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create-guest')
  @ApiOkResponse({ type: GuestResDto })
  @Post('guests')
  createGuest(@Body() createGuestDto: CreateGuestReqDto) {
    return this.guestService.createGuest(createGuestDto);
  }
}
