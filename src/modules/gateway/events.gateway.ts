import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: true })
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private subscribers = new Set<Socket>();

  handleConnection(client: Socket) {
    this.subscribers.add(client);
  }

  handleDisconnect(client: Socket) {
    this.subscribers.delete(client);
  }

  @OnEvent('order.created')
  handleOrderCreated(data: any) {
    this.server.emit('order:created', data);
  }

  @OnEvent('order.assigned')
  handleOrderAssigned(data: any) {
    this.server.emit('order:assigned', data);
  }

  @OnEvent('order.completed')
  handleOrderCompleted(data: any) {
    this.server.emit('order:completed', data);
  }

  @OnEvent('bot.added')
  handleBotAdded(data: any) {
    this.server.emit('bot:added', data);
  }

  @OnEvent('bot.removed')
  handleBotRemoved(data: any) {
    this.server.emit('bot:removed', data);
  }

  broadcastState(state: any) {
    this.server.emit('state:updated', state);
  }
}
