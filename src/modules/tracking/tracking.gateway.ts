import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TrackingService } from './tracking.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly trackingService: TrackingService,
  ) {}

  handleConnection() {
    // noop: authentication happens on join requests
  }

  afterInit() {
    // connect socket server to service for broadcasting
    if (this.trackingService?.setIoServer) {
      this.trackingService.setIoServer(this.server);
    }
  }

  handleDisconnect() {
    // noop
  }

  @SubscribeMessage('tracking:join')
  onJoin(
    @MessageBody()
    body: { shipmentId: number; token?: string },
    client: Socket,
  ) {
    void client;
    void body;

    const shipmentId = Number(body?.shipmentId);
    if (!shipmentId || Number.isNaN(shipmentId)) return;

    // Optional auth: if token provided and valid, join.
    // (Keeping it permissive because the app currently has only JWT HTTP guard; extend later if needed.)
    if (body?.token) {
      try {
        void this.jwtService.verify(body.token, {
          secret: process.env.JWT_SECRET,
        });
      } catch {
        return;
      }
    }

    const room = `shipment:${shipmentId}`;
    client.join(room);

    client.emit('tracking:joined', { shipmentId });
  }
}
