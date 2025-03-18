import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(private prismaService: PrismaService) {}

  async insert(userId: number, tokenId: string, expiresAt: Date) {
    await this.prismaService.refreshToken.create({
      data: {
        token: tokenId,
        accountId: userId,
        expiresAt,
      },
    });

    return tokenId;
  }

  async findToken(tokenId: string) {
    const storedToken = await this.prismaService.refreshToken.findUnique({
      where: { token: tokenId },
    });

    return storedToken;
  }

  async validate(userId: number, tokenId: string) {
    const storedToken = await this.findToken(tokenId);

    if (!storedToken || storedToken.accountId !== userId) {
      return false;
    }

    if (storedToken.expiresAt < new Date()) {
      await this.invalidate(tokenId);
      return false;
    }

    return true;
  }

  async invalidate(tokenId: string) {
    await this.prismaService.refreshToken.delete({
      where: { token: tokenId },
    });
  }

  async removeToken(tokenId: string) {
    const storedToken = await this.findToken(tokenId);

    if (storedToken) {
      await this.invalidate(tokenId);
    }
  }
}
