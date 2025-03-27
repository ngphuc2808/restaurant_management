import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@/constants/type';

import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';

export class UpdateAccountReqDto extends CreateAccountReqDto {
  @IsEnum([Role.Owner, Role.Employee])
  @ApiProperty()
  role: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  changePassword: boolean;
}
