import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { Role } from '@/constants/type';

@Injectable()
export class SocketService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async findOneWithAccountId(accountId: number) {
    try {
      const socket = await this.prisma.socket.findUnique({
        where: { accountId },
      });

      return socket;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async upsertSocket(userId: number, socketId: string, role: string) {
    try {
      if (role === Role.Guest) {
        await this.prisma.socket.upsert({
          where: {
            guestId: userId,
          },
          update: {
            socketId: socketId,
          },
          create: {
            guestId: userId,
            socketId: socketId,
          },
        });
      } else {
        await this.prisma.socket.upsert({
          where: {
            accountId: userId,
          },
          update: {
            socketId: socketId,
          },
          create: {
            accountId: userId,
            socketId: socketId,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error in upsertSocket: ${error.message}`);
      throw error;
    }
  }
}
