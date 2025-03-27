import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { AuthService } from '@/auth/auth.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { ManagerRoom, Role } from '@/constants/type';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let authService: AuthService;

  const mockServer = {
    emit: jest.fn(),
  };

  const mockClient = {
    id: 'mock-socket-id',
    handshake: {
      auth: {
        decodedAccessToken: null,
      },
    },
    join: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockDecodedToken = {
    id: 1,
    email: 'test@example.com',
    role: Role.Employee,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketGateway,
        {
          provide: AuthService,
          useValue: {
            validateSocket: jest.fn().mockResolvedValue(mockDecodedToken),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
    authService = module.get<AuthService>(AuthService);

    // Mock WebSocketServer
    gateway.server = mockServer as unknown as Server;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log initialization', async () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');

      await gateway.afterInit();

      expect(logSpy).toHaveBeenCalledWith('Initialized!');
    });
  });

  describe('handleConnection', () => {
    it('should handle employee connection successfully', async () => {
      jest
        .spyOn(authService, 'validateSocket')
        .mockResolvedValue(mockDecodedToken);

      const logSpy = jest.spyOn(gateway['logger'], 'log');

      await gateway.handleConnection(mockClient as unknown as Socket);

      expect(authService.validateSocket).toHaveBeenCalledWith(mockClient);
      expect(mockClient.handshake.auth.decodedAccessToken).toEqual(
        mockDecodedToken,
      );
      expect(mockClient.join).toHaveBeenCalledWith(ManagerRoom);
      expect(logSpy).toHaveBeenCalledWith(`Client connected: ${mockClient.id}`);
    });

    it('should handle guest connection without joining manager room', async () => {
      const guestToken = { ...mockDecodedToken, role: 'GUEST' };
      jest.spyOn(authService, 'validateSocket').mockResolvedValue(guestToken);

      await gateway.handleConnection(mockClient as unknown as Socket);

      expect(mockClient.handshake.auth.decodedAccessToken).toEqual(guestToken);
      expect(mockClient.join).not.toHaveBeenCalledWith(ManagerRoom);
    });

    it('should handle authentication failure', async () => {
      jest
        .spyOn(authService, 'validateSocket')
        .mockRejectedValue(new Error('Auth failed'));

      const errorSpy = jest.spyOn(gateway['logger'], 'error');

      await gateway.handleConnection(mockClient as unknown as Socket);

      expect(errorSpy).toHaveBeenCalledWith(
        'Authentication error: Auth failed',
      );
      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');

      gateway.handleDisconnect(mockClient as unknown as Socket);

      expect(logSpy).toHaveBeenCalledWith(
        `Client disconnected: ${mockClient.id}`,
      );
    });
  });
});
