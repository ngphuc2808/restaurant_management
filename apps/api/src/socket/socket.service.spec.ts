import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { SocketService } from '@/socket/socket.service';
import { Role } from '@/constants/type';

describe('SocketService', () => {
  let service: SocketService;
  let prismaService: PrismaService;
  let logger: Logger;

  const mockSocket = {
    id: 1,
    socketId: 'mock-socket-id',
    accountId: 1,
    guestId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            socket: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SocketService>(SocketService);
    logger = module.get<Logger>(Logger);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('findOneWithAccountId', () => {
    it('should find a socket by account id', async () => {
      const findSpy = jest
        .spyOn(prismaService.socket, 'findUnique')
        .mockResolvedValue(mockSocket);

      const result = await service.findOneWithAccountId(mockSocket.accountId);

      expect(result).toEqual(mockSocket);
      expect(findSpy).toHaveBeenCalledWith({
        where: { accountId: mockSocket.accountId },
      });
    });

    it('should throw error when find fails', async () => {
      const errorMessage = 'Failed to find socket';
      jest
        .spyOn(prismaService.socket, 'findUnique')
        .mockRejectedValue(new Error(errorMessage));

      const errorSpy = jest.spyOn(logger, 'error');

      await expect(
        service.findOneWithAccountId(mockSocket.accountId),
      ).rejects.toThrow(errorMessage);

      expect(errorSpy).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('upsertSocket', () => {
    describe('for account', () => {
      it('should upsert socket for account', async () => {
        const updatedSocket = { ...mockSocket, socketId: 'new-socket-id' };
        jest
          .spyOn(prismaService.socket, 'upsert')
          .mockResolvedValue(updatedSocket);

        await service.upsertSocket(
          mockSocket.accountId,
          'new-socket-id',
          Role.Employee,
        );

        expect(prismaService.socket.upsert).toHaveBeenCalledWith({
          where: {
            accountId: mockSocket.accountId,
          },
          update: {
            socketId: 'new-socket-id',
          },
          create: {
            accountId: mockSocket.accountId,
            socketId: 'new-socket-id',
          },
        });
      });
    });

    describe('for guest', () => {
      const mockGuestSocket = {
        ...mockSocket,
        accountId: null,
        guestId: 1,
      };

      it('should upsert socket for guest', async () => {
        const updatedGuestSocket = {
          ...mockGuestSocket,
          socketId: 'new-socket-id',
        };
        jest
          .spyOn(prismaService.socket, 'upsert')
          .mockResolvedValue(updatedGuestSocket);

        await service.upsertSocket(
          mockGuestSocket.guestId,
          'new-socket-id',
          Role.Guest,
        );

        expect(prismaService.socket.upsert).toHaveBeenCalledWith({
          where: {
            guestId: mockGuestSocket.guestId,
          },
          update: {
            socketId: 'new-socket-id',
          },
          create: {
            guestId: mockGuestSocket.guestId,
            socketId: 'new-socket-id',
          },
        });
      });
    });

    it('should throw error when operation fails', async () => {
      const errorMessage = 'Failed to upsert socket';
      jest
        .spyOn(prismaService.socket, 'upsert')
        .mockRejectedValue(new Error(errorMessage));

      const errorSpy = jest.spyOn(logger, 'error');

      await expect(
        service.upsertSocket(1, 'socket-id', 'USER'),
      ).rejects.toThrow(errorMessage);

      expect(errorSpy).toHaveBeenCalledWith(
        `Error in upsertSocket: ${errorMessage}`,
      );
    });
  });
});
