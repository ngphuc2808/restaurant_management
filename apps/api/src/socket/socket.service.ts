import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

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
}
