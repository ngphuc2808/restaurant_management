import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { SocketService } from './socket.service';
import { ManagerRoom } from '@/constants/type';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_PUBLIC_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
  ) {
    if (process.env.NODE_ENV === 'test') {
      this.logger.error = () => {};
    }
  }

  async afterInit() {
    this.logger.log('Initialized!');
  }

  async handleConnection(client: Socket) {
    try {
      const decodedToken = await this.authService.validateSocket(client);
      this.logger.log(`Client connected: ${client.id}`);

      client.handshake.auth.decodedAccessToken = decodedToken;

      if (decodedToken.role !== 'GUEST') {
        client.join(ManagerRoom);
      }
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const decodedToken = client.handshake.auth.decodedAccessToken;
      if (decodedToken) {
        await this.socketService.removeSocket(
          decodedToken.sub,
          decodedToken.role,
        );
      }
    } catch (error) {
      this.logger.error(`Error in handleDisconnect: ${error.message}`);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
