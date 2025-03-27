import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcryptjs';
import * as ms from 'ms';

import { Account } from '@prisma/client';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';

import { PrismaService } from '@/prisma.service';
import { SocketService } from '@/socket/socket.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import {
  PrismaErrorCode,
  isPrismaClientKnownRequestError,
} from '@/utils/errors';
import { Role } from '@/constants/type';

@Injectable()
export class AuthService {
  constructor(
    private logger: Logger,
    private i18n: I18nService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private refreshTokenService: RefreshTokenService,
    private socketService: SocketService,
  ) {}

  async validateSocket(socket: Socket) {
    const { Authorization } = socket.handshake.auth;

    if (!Authorization || !Authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authorization.invalid'),
      );
    }

    const accessToken = Authorization.split(' ')[1];

    try {
      const secret = await this.configService.get('JWT_ACCESS_TOKEN_SECRET');

      const decodedAccessToken = await this.jwtService.verifyAsync(
        accessToken,
        {
          secret,
        },
      );

      const { id, role } = decodedAccessToken;

      await this.socketService.upsertSocket(id, socket.id, role);

      return decodedAccessToken;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async validateAccount(email: string, pass: string) {
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

      if (!(await bcrypt.compare(pass, account.password))) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.auth.invalid-email-or-password'),
          errors: [
            {
              field: 'password',
              message: this.i18n.t('errors.auth.invalid-email-or-password'),
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

  async login(body: LoginReqDto) {
    try {
      const { email, password } = body;

      const account = await this.validateAccount(email, password);
      return this.generateTokens(account);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async generateTokens(account: Account) {
    try {
      const payload = {
        id: account.id,
        email: account.email,
        role: account.role,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(payload),
        this.getRefreshToken(payload),
      ]);

      return {
        account: { ...payload, avatar: account.avatar, name: account.name },
        accessToken,
        refreshToken: refreshToken.refreshToken,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async generateGuestTokens(id: number) {
    try {
      const payload = {
        id,
        role: Role.Guest,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(payload),
        this.getGuestRefreshToken(payload),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getAccessToken(account: { id: number; email?: string; role: string }) {
    try {
      const data = {
        id: account.id,
        email: account.email,
        role: account.role,
      };

      const expiresTime =
        (await this.configService.get(
          account.role === Role.Guest
            ? 'GUEST_JWT_ACCESS_TOKEN_EXPIRES_IN'
            : 'JWT_ACCESS_TOKEN_EXPIRES_IN',
        )) || '15m';
      const secret =
        (await this.configService.get('JWT_ACCESS_TOKEN_SECRET')) || 'secret';

      const accessToken = await this.jwtService.signAsync(data, {
        secret,
        expiresIn: Number(ms(expiresTime)) / 1000,
      });

      return accessToken;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getRefreshToken(account: { id: number; email: string; role: string }) {
    try {
      const data = {
        id: account.id,
        email: account.email,
        role: account.role,
      };

      const expiresTime =
        (await this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')) || '7d';
      const secret =
        (await this.configService.get('JWT_REFRESH_TOKEN_SECRET')) || 'secret';

      const refreshTokenExpiresAt = new Date(Date.now() + ms(expiresTime));

      const refreshToken = await this.jwtService.signAsync(data, {
        secret,
        expiresIn: Number(ms(expiresTime)) / 1000,
      });

      await this.refreshTokenService.insert(
        data.id,
        refreshToken,
        refreshTokenExpiresAt,
      );

      return { refreshToken, refreshTokenExpiresAt };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getGuestRefreshToken(account: { id: number; role: string }) {
    try {
      const data = {
        id: account.id,
        role: account.role,
      };

      const expiresTime =
        (await this.configService.get('GUEST_JWT_REFRESH_TOKEN_EXPIRES_IN')) ||
        '7d';
      const secret =
        (await this.configService.get('JWT_REFRESH_TOKEN_SECRET')) || 'secret';

      const refreshTokenExpiresAt = new Date(Date.now() + ms(expiresTime));

      const refreshToken = await this.jwtService.signAsync(data, {
        secret,
        expiresIn: Number(ms(expiresTime)) / 1000,
      });

      return { refreshToken, refreshTokenExpiresAt };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async processNewToken(refreshToken: string) {
    try {
      const secret = await this.configService.get('JWT_REFRESH_TOKEN_SECRET');
      const { id, email } = await this.jwtService.verifyAsync(refreshToken, {
        secret,
      });

      const userId = Number(id);
      const isValid = await this.refreshTokenService.validate(
        userId,
        refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException(this.i18n.t('errors.token.invalid'));
      }

      await this.refreshTokenService.invalidate(refreshToken);
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

      return this.generateTokens(account);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async processNewGuestToken(refreshToken: string) {
    try {
      const secret = await this.configService.get('JWT_REFRESH_TOKEN_SECRET');
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret,
      });

      const userId = Number(id);

      const token = await this.generateGuestTokens(userId);

      return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken.refreshToken,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.refreshTokenService.invalidate(refreshToken);
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.RecordNotFound) {
          throw new UnprocessableEntityException(
            this.i18n.t('errors.token.invalid'),
          );
        }
      }
      this.logger.error(error.message);
      throw error;
    }
  }
}
