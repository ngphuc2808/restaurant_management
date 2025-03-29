import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '@/prisma.service';
import { Role } from '@/constants/type';

type SocketData = {
  socketId: string;
  accountId: number | null;
  guestId: number | null;
};

@Injectable()
export class SocketService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.checkRedisConnection();
  }

  private async checkRedisConnection() {
    try {
      this.logger.log('Redis connection successful');
    } catch (error) {
      this.logger.error('Redis connection failed:', error.message);
    }
  }

  async findOneWithAccountId(accountId: number): Promise<SocketData | null> {
    try {
      const cachedSocket = await this.cacheManager.get<unknown>(
        `socket:account:${accountId}`,
      );
      if (cachedSocket) {
        const typedSocket = cachedSocket as SocketData;
        if (this.isValidSocketData(typedSocket)) {
          return typedSocket;
        }

        await this.cacheManager.del(`socket:account:${accountId}`);
      }

      const socket = await this.prisma.socket.findUnique({
        where: { accountId },
      });

      if (socket) {
        await this.cacheManager.set(
          `socket:account:${accountId}`,
          socket,
          3600000,
        );
      }

      return socket;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findOneWithGuestId(guestId: number): Promise<SocketData | null> {
    try {
      const cachedSocket = await this.cacheManager.get<unknown>(
        `socket:guest:${guestId}`,
      );

      if (cachedSocket) {
        const typedSocket = cachedSocket as SocketData;
        if (this.isValidSocketData(typedSocket)) {
          return typedSocket;
        }

        await this.cacheManager.del(`socket:guest:${guestId}`);
      }

      const socket = await this.prisma.socket.findUnique({
        where: { guestId },
      });

      if (socket) {
        await this.cacheManager.set(`socket:guest:${guestId}`, socket, 3600000);
      }

      return socket;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  private isValidSocketData(data: unknown): data is SocketData {
    if (!data || typeof data !== 'object') return false;

    const socket = data as SocketData;
    return (
      typeof socket.socketId === 'string' &&
      (socket.accountId === null || typeof socket.accountId === 'number') &&
      (socket.guestId === null || typeof socket.guestId === 'number')
    );
  }

  async upsertSocket(
    userId: number,
    socketId: string,
    role: string,
  ): Promise<SocketData> {
    try {
      let result: SocketData;
      if (role === Role.Guest) {
        const prismaResult = await this.prisma.socket.upsert({
          where: { guestId: userId },
          update: { socketId },
          create: {
            guestId: userId,
            socketId,
            accountId: null,
          },
        });

        result = {
          socketId: prismaResult.socketId,
          accountId: prismaResult.accountId,
          guestId: prismaResult.guestId,
        };

        await this.cacheManager.set(`socket:guest:${userId}`, result, 3600000);
      } else {
        const prismaResult = await this.prisma.socket.upsert({
          where: { accountId: userId },
          update: { socketId },
          create: {
            accountId: userId,
            socketId,
            guestId: null,
          },
        });

        result = {
          socketId: prismaResult.socketId,
          accountId: prismaResult.accountId,
          guestId: prismaResult.guestId,
        };

        await this.cacheManager.set(
          `socket:account:${userId}`,
          result,
          3600000,
        );
      }
      return result;
    } catch (error) {
      this.logger.error(`Error in upsertSocket: ${error.message}`);
      throw error;
    }
  }

  async removeSocket(userId: number, role: string) {
    try {
      if (role === Role.Guest) {
        await this.cacheManager.del(`socket:guest:${userId}`);
      } else {
        await this.cacheManager.del(`socket:account:${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error removing socket cache: ${error.message}`);
    }
  }
}
