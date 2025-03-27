import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@/prisma.service';
import { CreateTableReqDto } from '@/table/dto/req/create.req.dto';
import { UpdateTableReqDto } from '@/table/dto/req/update.req.dto';
import {
  isPrismaClientKnownRequestError,
  PrismaErrorCode,
} from '@/utils/errors';
import { randomId } from '@/utils/helpers';
import { PaginationReqDto } from '@/utils/paginate.dto';

@Injectable()
export class TableService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
  ) {}

  async getDetail(number: number) {
    try {
      return await this.prisma.table.findUnique({
        where: { number },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.table.no-table-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async getTableList({ page, limit }: PaginationReqDto) {
    try {
      if (!page || page <= 0) page = 1;
      if (!limit || limit <= 0) limit = 12;

      const skip = (page - 1) * limit;

      const tables = await this.prisma.table.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.table.count();

      return {
        tables,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async create(body: CreateTableReqDto) {
    try {
      const token = randomId();
      return await this.prisma.table.create({
        data: { ...body, token },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.UniqueConstraintViolation) {
          throw new UnprocessableEntityException({
            message: this.i18n.t('errors.table.table-already-exists'),
            errors: [
              {
                field: 'number',
                message: this.i18n.t('errors.table.table-already-exists'),
              },
            ],
          });
        }
      }
      this.logger.error(error);
      throw error;
    }
  }

  async update(number: number, body: UpdateTableReqDto) {
    try {
      if (body.changeToken) {
        const token = randomId();
        return await this.prisma.$transaction(async (tx) => {
          const [table] = await Promise.all([
            tx.table.update({
              where: { number },
              data: {
                status: body.status,
                capacity: body.capacity,
                token,
              },
            }),
            tx.guest.updateMany({
              where: { tableNumber: number },
              data: {
                refreshToken: null,
                refreshTokenExpiresAt: null,
              },
            }),
          ]);
          return table;
        });
      } else {
        return await this.prisma.table.update({
          where: {
            number,
          },
          data: {
            status: body.status,
            capacity: body.capacity,
          },
        });
      }
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.table.no-table-found'),
          );
        }
      }
    }
  }

  async delete(number: number) {
    try {
      return await this.prisma.table.delete({
        where: { number },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.table.no-table-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async getTableByToken(number: number, token: string) {
    try {
      return await this.prisma.table.findUnique({
        where: { number, token },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
