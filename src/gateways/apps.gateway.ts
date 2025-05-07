import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AppsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('AppsGateway');
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Handle connection event
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Handle disconnection event
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    // @ConnectedSocket() client: Socket,
  ) {
    // Handle received message
    this.logger.log(`Message received: ${data}`);
    this.server.emit('message', data); // Broadcast the message to all connected clients
  }
}
