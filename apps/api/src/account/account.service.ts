import { PrismaService } from '@/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';

import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { Role } from '@/constants/type';
import { PaginationReqDto } from './dto/req/paginate.req.dto';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
    private logger: Logger,
  ) {}

  async me(id: number) {
    try {
      return await this.prisma.account.findUniqueOrThrow({
        where: { id },
        omit: {
          password: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccountList({ page, limit }: PaginationReqDto) {
    const skip = (page - 1) * limit;

    const accounts = await this.prisma.account.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      omit: {
        password: true,
      },
    });

    const total = await this.prisma.account.count();

    return {
      accounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(accountDto: CreateAccountReqDto) {
    try {
      const { email, password, name, avatar } = accountDto;

      const existingAccount = await this.prisma.account.findUnique({
        where: { email },
      });

      if (existingAccount) {
        throw new BadRequestException({
          message: this.i18n.t('errors.auth.email-already-exists'),
          errors: [{ field: 'email', message: 'Email already exists' }],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        name,
        email,
        password: hashedPassword,
        avatar,
        role: Role.Employee,
      };

      const account = await this.prisma.account.create({
        data,
        omit: {
          password: true,
        },
      });
      return account;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccountDetail(accountId: number) {
    try {
      return await this.prisma.account.findUniqueOrThrow({
        where: {
          id: accountId,
        },
        omit: {
          password: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
