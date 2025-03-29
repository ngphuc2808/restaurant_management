import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/prisma.service';
import { TimeReqDto } from '@/utils/time.dto';
import { OrderStatus } from '@/constants/type';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class IndicatorService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getIndicators({ fromDate, toDate }: TimeReqDto) {
    try {
      const [orders, guests, dishes] = await Promise.all([
        this.prisma.order.findMany({
          include: {
            dishSnapshot: true,
            table: true,
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
        }),
        this.prisma.guest.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
            orders: {
              some: {
                status: OrderStatus.Paid,
              },
            },
          },
        }),
        this.prisma.dish.findMany(),
      ]);

      // Doanh thu
      let revenue = 0;
      // Số lượng khách gọi món thành công
      const guestCount = guests.length;
      // Số lượng đơn
      const orderCount = orders.length;
      // Thống kê món ăn
      const dishIndicatorObj: Record<
        number,
        {
          id: number;
          name: string;
          price: number;
          description: string;
          image: string;
          status: string;
          createdAt: Date;
          updatedAt: Date;
          successOrders: number; // Số lượng đã đặt thành công
        }
      > = dishes.reduce((acc, dish) => {
        acc[dish.id] = { ...dish, successOrders: 0 };
        return acc;
      }, {} as any);
      // Doanh thu theo ngày
      // Tạo object revenueByDateObj với key là ngày từ fromDate -> toDate và value là doanh thu
      const revenueByDateObj: { [key: string]: number } = {};

      // Lặp từ fromDate -> toDate
      for (
        let i = new Date(fromDate);
        i <= new Date(toDate);
        i.setDate(i.getDate() + 1)
      ) {
        revenueByDateObj[
          formatInTimeZone(
            i,
            this.configService.get('SERVER_TIMEZONE'),
            'dd/MM/yyyy',
          )
        ] = 0;
      }

      // Số lượng bàn đang được sử dụng
      const tableNumberObj: { [key: number]: boolean } = {};
      orders.forEach((order) => {
        if (order.status === OrderStatus.Paid) {
          revenue += order.dishSnapshot.price * order.quantity;
          if (
            order.dishSnapshot.dishId &&
            dishIndicatorObj[order.dishSnapshot.dishId]
          ) {
            dishIndicatorObj[order.dishSnapshot.dishId].successOrders++;
          }
          const date = formatInTimeZone(
            order.createdAt,
            this.configService.get('SERVER_TIMEZONE'),
            'dd/MM/yyyy',
          );
          revenueByDateObj[date] =
            (revenueByDateObj[date] ?? 0) +
            order.dishSnapshot.price * order.quantity;
        }
        if (
          [
            OrderStatus.Processing,
            OrderStatus.Pending,
            OrderStatus.Delivered,
          ].includes(order.status as any) &&
          order.tableNumber !== null
        ) {
          tableNumberObj[order.tableNumber] = true;
        }
      });
      // Số lượng bàn đang sử dụng
      const servingTableCount = Object.keys(tableNumberObj).length;

      // Doanh thu theo ngày
      const revenueByDate = Object.keys(revenueByDateObj).map((date) => {
        return {
          date,
          revenue: revenueByDateObj[date],
        };
      });
      const dishIndicator = Object.values(dishIndicatorObj);

      return {
        revenue,
        guestCount,
        orderCount,
        servingTableCount,
        dishIndicator,
        revenueByDate,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
