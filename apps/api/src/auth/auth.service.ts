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
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { Role } from '@/constants/type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
    private i18n: I18nService,
    private logger: Logger,
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

      if (role === Role.Guest) {
        await this.prisma.socket.upsert({
          where: {
            guestId: id,
          },
          update: {
            socketId: socket.id,
          },
          create: {
            guestId: id,
            socketId: socket.id,
          },
        });
      } else {
        await this.prisma.socket.upsert({
          where: {
            accountId: id,
          },
          update: {
            socketId: socket.id,
          },
          create: {
            accountId: id,
            socketId: socket.id,
          },
        });
      }
      return decodedAccessToken;
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
          message: this.i18n.t('errors.login.invalid-email'),
          errors: [
            {
              field: 'email',
              message: this.i18n.t('errors.login.invalid-email'),
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

  async validateAccount(email: string, pass: string) {
    try {
      const account = await this.findAccountWithEmail(email);

      if (!(await bcrypt.compare(pass, account.password))) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('errors.login.invalid-email-or-password'),
          errors: [
            {
              field: 'password',
              message: this.i18n.t('errors.login.invalid-email-or-password'),
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

  async login(loginDto: LoginReqDto) {
    try {
      const { email, password } = loginDto;

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

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.getRefreshToken(payload);

      return {
        account: { ...payload, avatar: account.avatar, name: account.name },
        accessToken,
        refreshToken,
      };
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

      const expiresAt = new Date(Date.now() + ms(expiresTime));

      const refreshToken = await this.jwtService.signAsync(data, {
        secret: secret,
        expiresIn: Number(ms(expiresTime)) / 1000,
      });

      await this.refreshTokenService.insert(data.id, refreshToken, expiresAt);

      return refreshToken;
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
      const account = await this.findAccountWithEmail(email);

      return this.generateTokens(account);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.refreshTokenService.removeToken(refreshToken);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
