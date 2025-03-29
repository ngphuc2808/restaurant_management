import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { AuthService } from '@/auth/auth.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { SocketService } from '@/socket/socket.service';
import { ManagerRoom, Role } from '@/constants/type';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let authService: AuthService;
  let socketService: SocketService;

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
          provide: SocketService,
          useValue: {
            removeSocket: jest.fn(),
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
    socketService = module.get<SocketService>(SocketService);

    // Mock WebSocketServer
    gateway.server = mockServer as unknown as Server;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
    expect(authService).toBeDefined();
    expect(socketService).toBeDefined();
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
    it('should remove socket data when client disconnects with valid token', async () => {
      const client = {
        ...mockClient,
        handshake: {
          auth: {
            decodedAccessToken: {
              sub: 1,
              role: Role.Employee,
            },
          },
        },
      };

      await gateway.handleDisconnect(client as unknown as Socket);

      expect(socketService.removeSocket).toHaveBeenCalledWith(1, Role.Employee);
    });

    it('should handle error when removing socket data fails', async () => {
      const error = new Error('Remove socket error');
      jest.spyOn(socketService, 'removeSocket').mockRejectedValue(error);
      const errorSpy = jest.spyOn(gateway['logger'], 'error');

      await gateway.handleDisconnect(mockClient as unknown as Socket);

      expect(errorSpy).toHaveBeenCalledWith(
        `Error in handleDisconnect: ${error.message}`,
      );
    });

    it('should log client disconnection', async () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');

      await gateway.handleDisconnect(mockClient as unknown as Socket);

      expect(logSpy).toHaveBeenCalledWith(
        `Client disconnected: ${mockClient.id}`,
      );
    });
  });
});
