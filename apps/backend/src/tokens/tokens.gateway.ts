import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TokensGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Socket Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinQueueRoom')
  handleJoinQueue(@MessageBody() hospitalId: string, @ConnectedSocket() client: Socket) {
    client.join(`hospital_${hospitalId}`);
    return { event: 'joinedRoom', room: `hospital_${hospitalId}` };
  }

  // Called when Doctor / Hospital calls next token
  async notifyQueueUpdate(hospitalId: string, currentToken: any, position: number) {
    this.server.to(`hospital_${hospitalId}`).emit('queueUpdated', {
      hospitalId,
      currentToken,
      updatedAt: new Date().toISOString(),
    });
  }
}
