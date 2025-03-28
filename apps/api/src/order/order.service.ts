import { PrismaService } from '@/prisma.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';
import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class OrderService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  async getListOrder({ fromDate, toDate, page, limit }: PaginationTimeReqDto) {
    try {
      if (!page || page <= 0) page = 1;
      if (!limit || limit <= 0) limit = 12;

      const skip = (page - 1) * limit;

      const orders = await this.prisma.order.findMany({
        skip,
        take: limit,
        include: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
      });
      return orders;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
