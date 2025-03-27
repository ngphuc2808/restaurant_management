import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@/prisma.service';
import { CreateDishReqDto } from '@/dish/dto/req/create.req.dto';
import { UpdateDishReqDto } from '@/dish/dto/req/update.req.dto';
import {
  isPrismaClientKnownRequestError,
  PrismaErrorCode,
} from '@/utils/errors';
import { PaginationReqDto } from '@/utils/paginate.dto';

@Injectable()
export class DishService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
  ) {}

  async getDetail(id: number) {
    try {
      return await this.prisma.dish.findUnique({
        where: { id },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.dish.no-dish-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async getList({ page, limit }: PaginationReqDto) {
    try {
      if (!page || page <= 0) page = 1;
      if (!limit || limit <= 0) limit = 12;

      const skip = (page - 1) * limit;

      const dishes = await this.prisma.dish.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.dish.count();

      return {
        dishes,
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

  async create(body: CreateDishReqDto) {
    try {
      return await this.prisma.dish.create({
        data: body,
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async update(id: number, body: UpdateDishReqDto) {
    try {
      return await this.prisma.dish.update({
        where: { id },
        data: body,
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.dish.no-dish-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.dish.delete({
        where: { id },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.dish.no-dish-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }
}
