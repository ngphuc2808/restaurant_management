import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { SocketService } from '@/socket/socket.service';
import { Role } from '@/constants/type';

describe('SocketService', () => {
  let service: SocketService;
  let prismaService: PrismaService;

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
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SocketService>(SocketService);
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
      jest
        .spyOn(prismaService.socket, 'findUnique')
        .mockRejectedValue(new Error('Failed to find socket'));

      await expect(
        service.findOneWithAccountId(mockSocket.accountId),
      ).rejects.toThrow('Failed to find socket');
    });
  });

  describe('upsertSocket', () => {
    describe('for account', () => {
      it('should update existing socket', async () => {
        const findSpy = jest
          .spyOn(prismaService.socket, 'findUnique')
          .mockResolvedValue(mockSocket);

        const updateSpy = jest
          .spyOn(prismaService.socket, 'update')
          .mockResolvedValue({ ...mockSocket, socketId: 'new-socket-id' });

        await service.upsertSocket(
          mockSocket.accountId,
          'new-socket-id',
          Role.Employee,
        );

        expect(findSpy).toHaveBeenCalledWith({
          where: { accountId: mockSocket.accountId },
        });
        expect(updateSpy).toHaveBeenCalledWith({
          where: { accountId: mockSocket.accountId },
          data: { socketId: 'new-socket-id' },
        });
      });

      it('should create new socket if not exists', async () => {
        const findSpy = jest
          .spyOn(prismaService.socket, 'findUnique')
          .mockResolvedValue(null);

        const createSpy = jest
          .spyOn(prismaService.socket, 'create')
          .mockResolvedValue(mockSocket);

        await service.upsertSocket(
          mockSocket.accountId,
          mockSocket.socketId,
          Role.Employee,
        );

        expect(findSpy).toHaveBeenCalledWith({
          where: { accountId: mockSocket.accountId },
        });
        expect(createSpy).toHaveBeenCalledWith({
          data: {
            accountId: mockSocket.accountId,
            socketId: mockSocket.socketId,
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

      it('should update existing guest socket', async () => {
        const findSpy = jest
          .spyOn(prismaService.socket, 'findUnique')
          .mockResolvedValue(mockGuestSocket);

        const updateSpy = jest
          .spyOn(prismaService.socket, 'update')
          .mockResolvedValue({ ...mockGuestSocket, socketId: 'new-socket-id' });

        await service.upsertSocket(
          mockGuestSocket.guestId,
          'new-socket-id',
          Role.Guest,
        );

        expect(findSpy).toHaveBeenCalledWith({
          where: { guestId: mockGuestSocket.guestId },
        });
        expect(updateSpy).toHaveBeenCalledWith({
          where: { guestId: mockGuestSocket.guestId },
          data: { socketId: 'new-socket-id' },
        });
      });

      it('should create new guest socket if not exists', async () => {
        const findSpy = jest
          .spyOn(prismaService.socket, 'findUnique')
          .mockResolvedValue(null);

        const createSpy = jest
          .spyOn(prismaService.socket, 'create')
          .mockResolvedValue(mockGuestSocket);

        await service.upsertSocket(
          mockGuestSocket.guestId,
          mockGuestSocket.socketId,
          Role.Guest,
        );

        expect(findSpy).toHaveBeenCalledWith({
          where: { guestId: mockGuestSocket.guestId },
        });
        expect(createSpy).toHaveBeenCalledWith({
          data: {
            guestId: mockGuestSocket.guestId,
            socketId: mockGuestSocket.socketId,
          },
        });
      });
    });

    it('should throw error when operation fails', async () => {
      jest
        .spyOn(prismaService.socket, 'findUnique')
        .mockRejectedValue(new Error('Failed to upsert socket'));

      await expect(
        service.upsertSocket(
          mockSocket.accountId,
          mockSocket.socketId,
          Role.Employee,
        ),
      ).rejects.toThrow('Failed to upsert socket');
    });
  });
});
