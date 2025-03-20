import { PrismaService } from '@/prisma.service';
import {
  Inject,
  Injectable,
  Logger,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '@/auth/auth.service';

import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { SocketService } from '@/socket/socket.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { PaginationReqDto } from '@/account/dto/req/paginate.req.dto';
import { UpdateMeReqDto } from '@/account/dto/req/update-me.req.dto';
import { ChangePasswordReqDto } from '@/account/dto/req/change-password.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { Role } from '@/constants/type';

@Injectable()
export class AccountService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private refreshTokenService: RefreshTokenService,
    private socketService: SocketService,
    private socketGateway: SocketGateway,
  ) {}

  async me(id: number) {
    try {
      return await this.prisma.account.findUniqueOrThrow({
        where: { id },
        omit: {
          password: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updateMe(id: number, body: UpdateMeReqDto) {
    try {
      return await this.prisma.account.update({
        where: {
          id,
        },
        data: body,
        omit: {
          password: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updatePassword(id: number, body: ChangePasswordReqDto) {
    try {
      const account = await this.prisma.account.findUniqueOrThrow({
        where: {
          id,
        },
      });

      if (!(await bcrypt.compare(body.oldPassword, account.password))) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.auth.old-password-is-incorrect'),
          errors: [
            {
              field: 'oldPassword',
              message: this.i18n.t('errors.auth.old-password-is-incorrect'),
            },
          ],
        });
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const newAccount = await this.prisma.account.update({
        where: {
          id,
        },
        data: {
          password: hashedPassword,
        },
      });

      await this.refreshTokenService.invalidateAll(id);

      return await this.authService.generateTokens(newAccount);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccountList({ page, limit }: PaginationReqDto) {
    try {
      const skip = (page - 1) * limit;

      const accounts = await this.prisma.account.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        omit: {
          password: true,
        },
      });

      const total = await this.prisma.account.count();

      return {
        accounts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async create(body: CreateAccountReqDto) {
    try {
      const { email, password, name, avatar } = body;

      const existingAccount = await this.prisma.account.findUnique({
        where: { email },
      });

      if (existingAccount) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.auth.email-already-exists'),
          errors: [
            {
              field: 'email',
              message: this.i18n.t('errors.auth.email-already-exists'),
            },
          ],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        name,
        email,
        password: hashedPassword,
        avatar,
        role: Role.Employee,
      };

      const account = await this.prisma.account.create({
        data,
        omit: {
          password: true,
        },
      });
      return account;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async deleteAccount(accountId: number) {
    try {
      const [socketRecord, oldAccount] = await Promise.all([
        this.socketService.findOneWithAccountId(accountId),
        this.prisma.account.findUnique({
          where: {
            id: accountId,
          },
        }),
      ]);

      if (!oldAccount) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.auth.no-user-found'),
          errors: [
            {
              field: 'oldPassword',
              message: this.i18n.t('errors.auth.no-user-found'),
            },
          ],
        });
      }

      const account = await this.prisma.account.delete({
        where: {
          id: accountId,
        },
      });

      if (socketRecord?.socketId) {
        this.socketGateway.server
          .to(socketRecord?.socketId)
          .emit('logout', account);
      }

      return account;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updateAccount(accountId: number, body: UpdateAccountReqDto) {
    try {
      const [socketRecord, oldAccount] = await Promise.all([
        this.socketService.findOneWithAccountId(accountId),
        this.prisma.account.findUnique({
          where: {
            id: accountId,
          },
        }),
      ]);

      if (!oldAccount) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.auth.no-user-found'),
          errors: [
            {
              field: 'oldPassword',
              message: this.i18n.t('errors.auth.no-user-found'),
            },
          ],
        });
      }

      if (body.email !== oldAccount.email) {
        await this.findAccountWithEmail(body.email);
      }

      const isChangeRole = oldAccount.role !== body.role;

      let dataUpdate = {
        ...body,
      };

      if (body.changePassword && body.password && body.confirmPassword) {
        const hashedPassword = await bcrypt.hash(body.password, 10);
        dataUpdate.password = hashedPassword;
      }

      delete dataUpdate.changePassword;
      delete dataUpdate.confirmPassword;

      const account = await this.prisma.account.update({
        where: {
          id: accountId,
        },
        data: dataUpdate,
        omit: {
          password: true,
        },
      });

      if (isChangeRole && socketRecord?.socketId) {
        this.socketGateway.server
          .to(socketRecord?.socketId)
          .emit('refresh-token', account);
      }

      return account;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccountDetail(accountId: number) {
    try {
      return await this.prisma.account.findUniqueOrThrow({
        where: {
          id: accountId,
        },
        omit: {
          password: true,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findAccountWithEmail(email: string) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { email },
      });

      if (!account) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.auth.invalid-email'),
          errors: [
            {
              field: 'email',
              message: this.i18n.t('errors.auth.invalid-email'),
            },
          ],
        });
      }

      return account;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
