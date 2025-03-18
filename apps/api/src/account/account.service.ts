import { PrismaService } from '@/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';

import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { Role } from '@/constants/type';

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
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async create(accountDto: CreateAccountReqDto) {
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
    });
    return account;
  }
}
