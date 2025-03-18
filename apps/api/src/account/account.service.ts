import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
    private logger: Logger,
  ) {}

  async me(id: number) {
    return await this.prisma.account.findUniqueOrThrow({
      where: { id },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
      },
    });
  }
}
