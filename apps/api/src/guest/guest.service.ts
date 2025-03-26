import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { TableService } from '@/table/table.service';
import { Role, TableStatus } from '@/constants/type';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import {
  isPrismaClientKnownRequestError,
  PrismaErrorCode,
} from '@/utils/errors';
@Injectable()
export class GuestService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
    private authService: AuthService,
    private tableService: TableService,
  ) {}

  async login(body: GuestLoginReqDto) {
    try {
      const table = await this.tableService.getTableByToken(
        body.tableNumber,
        body.token,
      );

      if (!table) {
        throw new BadRequestException(
          this.i18n.t('errors.table.table-invalid-token'),
        );
      }

      if (table.status === TableStatus.Hidden) {
        throw new BadRequestException(this.i18n.t('errors.table.table-hidden'));
      }

      if (table.status === TableStatus.Reserved) {
        throw new BadRequestException(
          this.i18n.t('errors.table.table-reserved'),
        );
      }

      let guest = await this.prisma.guest.create({
        data: {
          name: body.name,
          tableNumber: body.tableNumber,
        },
      });

      const { accessToken, refreshToken } =
        await this.authService.generateGuestTokens(guest.id);

      guest = await this.prisma.guest.update({
        where: {
          id: guest.id,
        },
        data: {
          ...refreshToken,
        },
      });

      return {
        guest: {
          id: guest.id,
          name: guest.name,
          role: Role.Guest,
          tableNumber: guest.tableNumber,
          createdAt: guest.createdAt,
          updatedAt: guest.updatedAt,
        },
        accessToken,
        refreshToken: refreshToken.refreshToken,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async logout(id: number) {
    try {
      await this.prisma.guest.update({
        where: {
          id,
        },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.auth.not-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }
}
