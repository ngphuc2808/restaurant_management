import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/public.decorator';
import { IndicatorService } from '@/indicator/indicator.service';
import { IndicatorResDto } from '@/indicator/dto/res/indicator.res.dto';
import { TimeReqDto } from '@/utils/time.dto';
import { ResponseMessage, Role } from '@/constants/type';

@UseGuards(RoleGuard)
@Roles([Role.Owner])
@Controller('indicators')
export class IndicatorController {
  constructor(private readonly indicatorService: IndicatorService) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('res.success.indicator.get')
  @ApiOkResponse({ type: IndicatorResDto })
  @Get()
  async getIndicators(
    @Query()
    getIndicatorsDto: TimeReqDto,
  ) {
    return await this.indicatorService.getIndicators(getIndicatorsDto);
  }
}
