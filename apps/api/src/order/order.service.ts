import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@/prisma.service';
import { SocketService } from '@/socket/socket.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';
import { CreateOrderReqDto } from '@/order/dto/req/create-order.req.dto';
import { UpdateOrderReqDto } from '@/order/dto/req/update-order.req.dto';
import {
  DishStatus,
  ManagerRoom,
  OrderStatus,
  TableStatus,
} from '@/constants/type';

@Injectable()
export class OrderService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
    private socketService: SocketService,
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

  async getOrder(orderId: number) {
    try {
      return this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
          table: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async createOrder(orderHandlerId: number, body: CreateOrderReqDto) {
    try {
      const { guestId, orders } = body;
      const guest = await this.prisma.guest.findUnique({
        where: {
          id: guestId,
        },
      });
      if (guest.tableNumber === null) {
        throw new BadRequestException(
          this.i18n.t('errors.order.table-deleted'),
        );
      }
      const table = await this.prisma.table.findUnique({
        where: {
          number: guest.tableNumber,
        },
      });
      if (table.status === TableStatus.Hidden) {
        throw new BadRequestException(
          this.i18n.t('errors.order.table-hidden', {
            args: { number: table.number },
          }),
        );
      }
      const [ordersRecord, socketRecord] = await Promise.all([
        this.prisma.$transaction(async (tx) => {
          const ordersRecord = await Promise.all(
            orders.map(async (order) => {
              const dish = await tx.dish.findUnique({
                where: {
                  id: order.dishId,
                },
              });
              if (dish.status === DishStatus.Unavailable) {
                throw new BadRequestException(
                  this.i18n.t('errors.order.dish-unavailable', {
                    args: { name: dish.name },
                  }),
                );
              }
              if (dish.status === DishStatus.Hidden) {
                throw new BadRequestException(
                  this.i18n.t('errors.order.dish-hidden', {
                    args: { name: dish.name },
                  }),
                );
              }
              const dishSnapshot = await tx.dishSnapshot.create({
                data: {
                  description: dish.description,
                  image: dish.image,
                  name: dish.name,
                  price: dish.price,
                  dishId: dish.id,
                  status: dish.status,
                },
              });
              const orderRecord = await tx.order.create({
                data: {
                  dishSnapshotId: dishSnapshot.id,
                  guestId,
                  quantity: order.quantity,
                  tableNumber: guest.tableNumber,
                  orderHandlerId,
                  status: OrderStatus.Pending,
                },
                include: {
                  dishSnapshot: true,
                  guest: true,
                  orderHandler: true,
                },
              });
              type OrderRecord = typeof orderRecord;
              return orderRecord as OrderRecord & {
                status: (typeof OrderStatus)[keyof typeof OrderStatus];
                dishSnapshot: OrderRecord['dishSnapshot'] & {
                  status: (typeof DishStatus)[keyof typeof DishStatus];
                };
              };
            }),
          );
          return ordersRecord;
        }),

        this.socketService.findOneWithGuestId(guestId),
      ]);

      if (socketRecord?.socketId) {
        this.socketGateway.server
          .to(ManagerRoom)
          .to(socketRecord?.socketId)
          .emit('new-order', orders);
      } else {
        this.socketGateway.server.to(ManagerRoom).emit('new-order', orders);
      }

      return ordersRecord;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updateOrder(
    orderId: number,
    orderHandlerId: number,
    body: UpdateOrderReqDto,
  ) {
    try {
      const { status, dishId, quantity } = body;
      const result = await this.prisma.$transaction(async (tx) => {
        const order = await this.prisma.order.findUnique({
          where: {
            id: orderId,
          },
          include: {
            dishSnapshot: true,
          },
        });
        let dishSnapshotId = order.dishSnapshotId;
        if (order.dishSnapshot.dishId !== dishId) {
          const dish = await tx.dish.findUnique({
            where: {
              id: dishId,
            },
          });
          const dishSnapshot = await tx.dishSnapshot.create({
            data: {
              description: dish.description,
              image: dish.image,
              name: dish.name,
              price: dish.price,
              dishId: dish.id,
              status: dish.status,
            },
          });
          dishSnapshotId = dishSnapshot.id;
        }
        const newOrder = await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            status,
            dishSnapshotId,
            quantity,
            orderHandlerId,
          },
          include: {
            dishSnapshot: true,
            orderHandler: true,
            guest: true,
          },
        });
        return newOrder;
      });
      const socketRecord = await this.socketService.findOneWithGuestId(
        result.guestId!,
      );

      if (socketRecord?.socketId) {
        this.socketGateway.server
          .to(socketRecord.socketId)
          .to(ManagerRoom)
          .emit('update-order', result);
      } else {
        this.socketGateway.server.to(ManagerRoom).emit('update-order', result);
      }

      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async payOrder(orderHandlerId: number, guestId: number) {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          guestId,
          status: {
            in: [
              OrderStatus.Pending,
              OrderStatus.Processing,
              OrderStatus.Delivered,
            ],
          },
        },
      });
      if (orders.length === 0) {
        throw new BadRequestException(
          this.i18n.t('errors.order.payment-not-found'),
        );
      }
      await this.prisma.$transaction(async (tx) => {
        const orderIds = orders.map((order) => order.id);
        const updatedOrders = await tx.order.updateMany({
          where: {
            id: {
              in: orderIds,
            },
          },
          data: {
            status: OrderStatus.Paid,
            orderHandlerId,
          },
        });
        return updatedOrders;
      });
      const [ordersResult, sockerRecord] = await Promise.all([
        this.prisma.order.findMany({
          where: {
            id: {
              in: orders.map((order) => order.id),
            },
          },
          include: {
            dishSnapshot: true,
            orderHandler: true,
            guest: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.socketService.findOneWithGuestId(guestId),
      ]);

      if (sockerRecord?.socketId) {
        this.socketGateway.server
          .to(sockerRecord?.socketId)
          .to(ManagerRoom)
          .emit('payment', ordersResult);
      } else {
        this.socketGateway.server.to(ManagerRoom).emit('payment', ordersResult);
      }

      return ordersResult;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
