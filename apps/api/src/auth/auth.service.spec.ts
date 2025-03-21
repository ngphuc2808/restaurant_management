import { Test, TestingModule } from '@nestjs/testing';
import {
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcryptjs';
import * as ms from 'ms';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { PrismaErrorCode } from '@/utils/errors';

import { AuthService } from './auth.service';
import { AccountService } from '@/account/account.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { SocketService } from '@/socket/socket.service';
import { LoginReqDto } from './dto/req/login.req.dto';
import { Account } from '@prisma/client';

jest.mock('bcryptjs');
jest.mock('ms');
jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  isPrismaClientKnownRequestError: jest.fn().mockImplementation(() => true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let accountService: AccountService;
  let refreshTokenService: RefreshTokenService;
  let socketService: SocketService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockAccount: Account = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'USER',
    avatar: 'avatar.jpg',
    ownerId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSocket = {
    handshake: {
      auth: {
        Authorization: 'Bearer valid-token',
      },
    },
    id: 'socket-id',
    nsp: { name: '/' },
    client: { id: 'client-id' },
    recovered: false,
    data: {},
    rooms: new Set(),
    flags: {},
    server: {},
    adapter: {},
    request: {},
    conn: {},
    remoteAddress: '',
    handshakeAddress: '',
    connected: true,
    disconnected: false,
    compress: false,
    io: {},
    json: {},
    volatile: {},
    broadcast: {},
    local: {},
    to: {},
    in: {},
    except: {},
    emit: {},
    listeners: {},
    listenerCount: 0,
    on: {},
    once: {},
    off: {},
    removeListener: {},
    removeAllListeners: {},
    eventNames: {},
    rawListeners: {},
    prependListener: {},
    prependOnceListener: {},
    timeout: {},
    disconnect: {},
    join: {},
    leave: {},
    leaveAll: {},
    emitWithAck: {},
    getBroadcastOperator: {},
  } as unknown as Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated-message'),
          },
        },
        {
          provide: AccountService,
          useValue: {
            findAccountWithEmail: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            insert: jest.fn(),
            validate: jest.fn(),
            invalidate: jest.fn(),
          },
        },
        {
          provide: SocketService,
          useValue: {
            upsertSocket: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountService = module.get<AccountService>(AccountService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    socketService = module.get<SocketService>(SocketService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('validateSocket', () => {
    it('should validate socket successfully', async () => {
      const mockDecodedToken = { id: 1, role: 'USER' };
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecodedToken);
      jest.spyOn(socketService, 'upsertSocket').mockResolvedValue(undefined);

      const result = await service.validateSocket(mockSocket);

      expect(result).toEqual(mockDecodedToken);
      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_TOKEN_SECRET');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'secret',
      });
      expect(socketService.upsertSocket).toHaveBeenCalledWith(
        1,
        'socket-id',
        'USER',
      );
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const invalidSocket = {
        handshake: {
          auth: {},
        },
        id: 'socket-id',
        nsp: { name: '/' },
        client: { id: 'client-id' },
        recovered: false,
        data: {},
        rooms: new Set(),
        flags: {},
        server: {},
        adapter: {},
        request: {},
        conn: {},
        remoteAddress: '',
        handshakeAddress: '',
        connected: true,
        disconnected: false,
        compress: false,
        io: {},
        json: {},
        volatile: {},
        broadcast: {},
        local: {},
        to: {},
        in: {},
        except: {},
        emit: {},
        listeners: {},
        listenerCount: 0,
        on: {},
        once: {},
        off: {},
        removeListener: {},
        removeAllListeners: {},
        eventNames: {},
        rawListeners: {},
        prependListener: {},
        prependOnceListener: {},
        timeout: {},
        disconnect: {},
        join: {},
        leave: {},
        leaveAll: {},
        emitWithAck: {},
        getBroadcastOperator: {},
      } as unknown as Socket<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap
      >;

      await expect(service.validateSocket(invalidSocket)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateAccount', () => {
    it('should validate account successfully', async () => {
      jest
        .spyOn(accountService, 'findAccountWithEmail')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateAccount(
        'test@example.com',
        'password',
      );

      expect(result).toEqual(mockAccount);
      expect(accountService.findAccountWithEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw UnprocessableEntityException when password is invalid', async () => {
      jest
        .spyOn(accountService, 'findAccountWithEmail')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateAccount('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginReqDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest
        .spyOn(accountService, 'findAccountWithEmail')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(900000); // 15 minutes

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('generateTokens', () => {
    it('should generate tokens successfully', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(900000); // 15 minutes

      const result = await service.generateTokens(mockAccount);

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('getAccessToken', () => {
    it('should generate access token successfully', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(900000); // 15 minutes

      const result = await service.getAccessToken({
        id: 1,
        email: 'test@example.com',
        role: 'USER',
      });

      expect(result).toBe('access-token');
      expect(jwtService.signAsync).toHaveBeenCalled();
    });
  });

  describe('getRefreshToken', () => {
    it('should generate refresh token successfully', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('refresh-token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(604800000); // 7 days
      jest.spyOn(refreshTokenService, 'insert').mockResolvedValue(undefined);

      const result = await service.getRefreshToken({
        id: 1,
        email: 'test@example.com',
        role: 'USER',
      });

      expect(result).toBe('refresh-token');
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(refreshTokenService.insert).toHaveBeenCalled();
    });
  });

  describe('processNewToken', () => {
    it('should process new token successfully', async () => {
      const mockDecodedToken = { id: 1, email: 'test@example.com' };
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecodedToken);
      jest.spyOn(refreshTokenService, 'validate').mockResolvedValue(true);
      jest
        .spyOn(refreshTokenService, 'invalidate')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountService, 'findAccountWithEmail')
        .mockResolvedValue(mockAccount);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await service.processNewToken('refresh-token');

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ id: 1, email: 'test@example.com' });
      jest.spyOn(refreshTokenService, 'validate').mockResolvedValue(false);

      await expect(service.processNewToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      jest
        .spyOn(refreshTokenService, 'invalidate')
        .mockResolvedValue(undefined);

      await service.logout('refresh-token');

      expect(refreshTokenService.invalidate).toHaveBeenCalledWith(
        'refresh-token',
      );
    });

    it('should throw UnprocessableEntityException when token is not found', async () => {
      jest.spyOn(refreshTokenService, 'invalidate').mockRejectedValue({
        code: PrismaErrorCode.RecordNotFound,
      });

      await expect(service.logout('invalid-token')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
