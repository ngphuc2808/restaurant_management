import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { Role } from '@/constants/type';

@Injectable()
export class SocketService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async findOneWithAccountId(accountId: number) {
    try {
      const socket = await this.prisma.socket.findUnique({
        where: { accountId },
      });

      return socket;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async upsertSocket(userId: number, socketId: string, role: string) {
    try {
      if (role === Role.Guest) {
        // Kiểm tra xem guest đã có socket chưa
        const existingSocket = await this.prisma.socket.findUnique({
          where: { guestId: userId },
        });

        // Xóa bất kỳ socket nào với socketId này trước
        try {
          await this.prisma.socket.delete({
            where: { socketId },
          });
        } catch {
          // Bỏ qua lỗi nếu không tìm thấy
        }

        if (existingSocket) {
          // Nếu guest đã có socket, cập nhật
          return await this.prisma.socket.update({
            where: { guestId: userId },
            data: { socketId: socketId },
          });
        } else {
          // Nếu guest chưa có socket, tạo mới
          return await this.prisma.socket.create({
            data: {
              guestId: userId,
              socketId: socketId,
            },
          });
        }
      } else {
        // Kiểm tra xem account đã có socket chưa
        const existingSocket = await this.prisma.socket.findUnique({
          where: { accountId: userId },
        });

        // Xóa bất kỳ socket nào với socketId này trước
        try {
          await this.prisma.socket.delete({
            where: { socketId },
          });
        } catch {
          // Bỏ qua lỗi nếu không tìm thấy
        }

        if (existingSocket) {
          // Nếu account đã có socket, cập nhật
          return await this.prisma.socket.update({
            where: { accountId: userId },
            data: { socketId: socketId },
          });
        } else {
          // Nếu account chưa có socket, tạo mới
          return await this.prisma.socket.create({
            data: {
              accountId: userId,
              socketId: socketId,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error in upsertSocket: ${error.message}`);
      throw error;
    }
  }
}
