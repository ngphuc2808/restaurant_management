import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async insert(userId: number, tokenId: string, expiresAt: Date) {
    try {
      await this.prisma.refreshToken.create({
        data: {
          token: tokenId,
          accountId: userId,
          expiresAt,
        },
      });

      return tokenId;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async validate(userId: number, tokenId: string) {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: tokenId },
      });

      if (!storedToken || storedToken.accountId !== userId) {
        return false;
      }

      if (storedToken.expiresAt < new Date()) {
        await this.invalidate(tokenId);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async invalidate(tokenId: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: tokenId },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async invalidateAll(accountId: number) {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { accountId },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
