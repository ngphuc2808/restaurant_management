import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { TableService } from '@/table/table.service';
import {
  DishStatus,
  ManagerRoom,
  OrderStatus,
  Role,
  TableStatus,
} from '@/constants/type';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestCreateDishReqDto } from '@/guest/dto/req/guest-create-dish.req.dto';
import {
  isPrismaClientKnownRequestError,
  PrismaErrorCode,
} from '@/utils/errors';
import { SocketGateway } from '@/socket/socket-gateway';
@Injectable()
export class GuestService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
    private authService: AuthService,
    private tableService: TableService,
    private socketGateway: SocketGateway,
  ) {}

  async login(body: GuestLoginReqDto) {
    try {
      const table = await this.tableService.getTableByToken(
        body.tableNumber,
        body.token,
      );

      if (!table) {
        throw new BadRequestException(
          this.i18n.t('errors.table.table-invalid-token'),
        );
      }

      if (table.status === TableStatus.Hidden) {
        throw new BadRequestException(this.i18n.t('errors.table.table-hidden'));
      }

      if (table.status === TableStatus.Reserved) {
        throw new BadRequestException(
          this.i18n.t('errors.table.table-reserved'),
        );
      }

      let guest = await this.prisma.guest.create({
        data: {
          name: body.name,
          tableNumber: body.tableNumber,
        },
      });

      const { accessToken, refreshToken } =
        await this.authService.generateGuestTokens(guest.id);

      guest = await this.prisma.guest.update({
        where: {
          id: guest.id,
        },
        data: {
          ...refreshToken,
        },
      });

      return {
        guest: {
          id: guest.id,
          name: guest.name,
          role: Role.Guest,
          tableNumber: guest.tableNumber,
          createdAt: guest.createdAt,
          updatedAt: guest.updatedAt,
        },
        accessToken,
        refreshToken: refreshToken.refreshToken,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async logout(id: number) {
    try {
      await this.prisma.guest.update({
        where: {
          id,
        },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.auth.not-found'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async processNewGuestToken(refreshToken: string) {
    try {
      const token = await this.authService.processNewGuestToken(refreshToken);
      return token;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getListOrder(guestId: number) {
    try {
      return await this.prisma.order.findMany({
        where: {
          guestId,
        },
        include: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async createDish(guestId: number, body: GuestCreateDishReqDto[]) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const guest = await tx.guest.findUnique({
          where: {
            id: guestId,
          },
          omit: {
            refreshToken: true,
            refreshTokenExpiresAt: true,
          },
        });

        if (guest.tableNumber === null) {
          throw new BadRequestException(
            this.i18n.t('errors.order.table-deleted'),
          );
        }

        const table = await tx.table.findUnique({
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
        if (table.status === TableStatus.Reserved) {
          throw new BadRequestException(
            this.i18n.t('errors.order.table-reserved', {
              args: { number: table.number },
            }),
          );
        }

        const orders = await Promise.all(
          body.map(async (order) => {
            const dish = await tx.dish.findUnique({
              where: {
                id: order.dishId,
              },
            });
            if (!dish) {
              throw new BadRequestException(
                this.i18n.t('errors.dish.no-dish-found'),
              );
            }
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
                orderHandlerId: null,
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

        return orders;
      });

      this.socketGateway.server.to(ManagerRoom).emit('new-order', result);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
