import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as ms from 'ms';

import { Account } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { AccountDto } from '@/auth/dto/account.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { TokenDto } from '@/auth/dto/token.dto';
import { RefreshTokenIdsStorage } from '@/auth/refresh-token-ids.storage';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private refreshTokenStorage: RefreshTokenIdsStorage,
    private configService: ConfigService,
  ) {}

  async createAccount(accountDto: AccountDto): Promise<Account> {
    const { email, password, name, avatar, role, ownerId } = accountDto;

    const existingAccount = await this.prisma.account.findUnique({
      where: { email },
    });
    if (existingAccount) {
      throw new BadRequestException({
        message: 'Email already exists',
        errors: [{ field: 'email', message: 'Email already exists' }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data: Parameters<typeof this.prisma.account.create>[0]['data'] = {
      name,
      email,
      password: hashedPassword,
      avatar,
      role,
    };
    if (ownerId && role === 'Employee') {
      const owner = await this.prisma.account.findUnique({
        where: { id: ownerId },
      });
      if (!owner) {
        throw new NotFoundException(`Owner with id ${ownerId} does not exists`);
      }
      if (owner.role !== 'Owner') {
        throw new BadRequestException(
          `User with id ${ownerId} does not have Owner role`,
        );
      }

      data.owner = {
        connect: { id: ownerId },
      };
    }

    try {
      const newAccount = await this.prisma.account.create({ data });
      return newAccount;
    } catch (error) {
      this.logger.error(`Error creating account: ${error.message}`);
      throw new BadRequestException('Failed to create account', error.message);
    }
  }

  async validateAccount(email: string, pass: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { email },
    });

    if (account && (await bcrypt.compare(pass, account.password))) {
      return account;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;

    const account = await this.validateAccount(email, password);

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(account);
  }

  async generateTokens(account: Account): Promise<TokenDto> {
    const payload = {
      id: account.id,
      email: account.email,
      role: account.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.getRefreshToken(payload);

    return {
      ...payload,
      accessToken,
      refreshToken,
    };
  }

  async getRefreshToken(account: {
    id: number;
    email: string;
    role: string;
  }): Promise<string> {
    const data = {
      id: account.id,
      email: account.email,
      role: account.role,
    };

    const expiresTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN');
    const secret = this.configService.get('JWT_REFRESH_TOKEN_SECRET');

    const expiresAt = new Date(Date.now() + ms(expiresTime));

    const refreshToken = await this.jwtService.signAsync(data, {
      secret: secret,
      expiresIn: Number(ms(expiresTime)) / 1000,
    });

    await this.refreshTokenStorage.insert(data.id, refreshToken, expiresAt);
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenDto> {
    try {
      const secret = this.configService.get('JWT_REFRESH_TOKEN_SECRET');
      const { sub } = await this.jwtService.verifyAsync(refreshToken, {
        secret,
      });

      const userId = Number(sub);
      const isValid = await this.refreshTokenStorage.validate(
        userId,
        refreshToken,
      );
      if (!isValid) {
        throw new UnauthorizedException();
      }
      await this.refreshTokenStorage.invalidate(userId, refreshToken);

      const account = await this.prisma.account.findUnique({
        where: { id: userId },
      });
      if (!account) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(account);
    } catch (e) {
      this.logger.error(e);
      throw new UnauthorizedException();
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const secret = this.configService.get('JWT_REFRESH_TOKEN_SECRET');
      const { sub } = await this.jwtService.verifyAsync(refreshToken, {
        secret,
      });
      const userId = Number(sub);
      await this.refreshTokenStorage.invalidate(userId, refreshToken);
    } catch (e) {
      this.logger.error('Failed to logout', e);
      throw new UnauthorizedException();
    }
  }

  async getAccountBySocketId(socketId: string): Promise<Account | null> {
    const socket = await this.prisma.socket.findUnique({
      where: { socketId },
      include: { account: true },
    });

    return socket?.account;
  }
}
