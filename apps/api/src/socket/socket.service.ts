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
      const existingSocket = await this.prisma.socket.findUnique({
        where:
          role === Role.Guest ? { guestId: userId } : { accountId: userId },
      });

      if (existingSocket) {
        await this.prisma.socket.update({
          where:
            role === Role.Guest ? { guestId: userId } : { accountId: userId },
          data: { socketId: socketId },
        });
      } else {
        await this.prisma.socket.create({
          data:
            role === Role.Guest
              ? { guestId: userId, socketId: socketId }
              : { accountId: userId, socketId: socketId },
        });
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
