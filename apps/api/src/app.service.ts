import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '@/constants/type';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing owner account...');
    try {
      await this.initOwnerAccount();
      this.logger.log('Owner account initialization completed');
    } catch (error) {
      this.logger.error('Failed to initialize owner account:', error.message);
      throw error;
    }
  }

  async initOwnerAccount() {
    try {
      const accountCount = await this.prisma.account.count();
      if (accountCount === 0) {
        const hashedPassword = await bcrypt.hash(
          this.configService.get('INITIAL_PASSWORD_OWNER'),
          10,
        );
        await this.prisma.account.create({
          data: {
            name: 'Owner',
            email: this.configService.get('INITIAL_EMAIL_OWNER'),
            password: hashedPassword,
            role: Role.Owner,
          },
        });
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
