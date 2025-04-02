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
  async me(@User() user: UserDto) {
    return await this.accountService.me(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update')
  @ApiOkResponse({ type: AccountResDto })
  @Put('me')
  async updateMe(@User() user: UserDto, @Body() updateMeDto: UpdateMeReqDto) {
    return await this.accountService.updateMe(user.id, updateMeDto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update-password')
  @ApiOkResponse({ type: AccountResDto })
  @Put('change-password')
  async updatePassword(
    @User() user: UserDto,
    @Body() changePasswordReqDto: ChangePasswordReqDto,
  ) {
    return await this.accountService.updatePassword(
      user.id,
      changePasswordReqDto,
    );
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-list')
  @ApiOkResponse({ type: GetAccountListResDto })
  @Get()
  async getAccountList(@Query() paginationDto: PaginationReqDto) {
    return await this.accountService.getAccountList(paginationDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get')
  @ApiOkResponse({ type: AccountResDto })
  @Get('detail/:id')
  async getAccountDetail(@Param('id') id: string) {
    return await this.accountService.getAccountDetail(Number(id));
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create')
  @ApiOkResponse({ type: AccountResDto })
  @Post()
  async create(
    @User() user: UserDto,
    @Body() createAccountDto: CreateAccountReqDto,
  ) {
    return await this.accountService.create(user.id, createAccountDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.update')
  @ApiOkResponse({ type: AccountResDto })
  @Put('detail/:id')
  async updateAccount(
    @User() user: UserDto,
    @Param('id') id: string,
    @Body() updateMeDto: UpdateAccountReqDto,
  ) {
    return await this.accountService.updateAccount(
      user.id,
      Number(id),
      updateMeDto,
    );
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.delete')
  @ApiOkResponse({ type: AccountResDto })
  @Delete('detail/:id')
  async deleteAccount(@User() user: UserDto, @Param('id') id: string) {
    return await this.accountService.deleteAccount(user.id, Number(id));
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.get-guest-list')
  @ApiOkResponse({ type: GetGuestListResDto })
  @Get('guests')
  async getListGuest(
    @Query()
    getListGuestDto: PaginationTimeReqDto,
  ) {
    return await this.guestService.getGuestList(getListGuestDto);
  }

  @UseGuards(RoleGuard)
  @Roles([Role.Owner, Role.Employee])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.account.create-guest')
  @ApiOkResponse({ type: GuestResDto })
  @Post('guests')
  async createGuest(@Body() createGuestDto: CreateGuestReqDto) {
    return await this.guestService.createGuest(createGuestDto);
  }
}
