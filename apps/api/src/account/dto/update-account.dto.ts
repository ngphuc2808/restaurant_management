import { PartialType } from '@nestjs/mapped-types';

import { AccountDto } from '@/account/dto/create-account.dto';

export class UpdateAccountDto extends PartialType(AccountDto) {}
