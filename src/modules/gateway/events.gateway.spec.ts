import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { Server, Socket } from 'socket.io';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    gateway.server = mockServer;
  });

  describe('connection lifecycle', () => {
    it('adds client on connection', () => {
      const client = { id: 'socket-1' } as Socket;
      gateway.handleConnection(client);

      expect((gateway as any).subscribers.size).toBe(1);
    });

    it('removes client on disconnect', () => {
      const client = { id: 'socket-1' } as Socket;
      gateway.handleConnection(client);
      expect((gateway as any).subscribers.size).toBe(1);

      gateway.handleDisconnect(client);
      expect((gateway as any).subscribers.size).toBe(0);
    });
  });

  describe('event handlers', () => {
    it('emits order:created on order.created event', () => {
      const data = { id: 1, orderType: 'NORMAL' };
      gateway.handleOrderCreated(data);
      expect(mockServer.emit).toHaveBeenCalledWith('order:created', data);
    });

    it('emits order:assigned on order.assigned event', () => {
      const data = { id: 1, status: 'ASSIGNED' };
      gateway.handleOrderAssigned(data);
      expect(mockServer.emit).toHaveBeenCalledWith('order:assigned', data);
    });

    it('emits order:completed on order.completed event', () => {
      const data = { id: 1, status: 'COMPLETE' };
      gateway.handleOrderCompleted(data);
      expect(mockServer.emit).toHaveBeenCalledWith('order:completed', data);
    });

    it('emits bot:added on bot.added event', () => {
      const data = { id: 1, name: 'bot-1' };
      gateway.handleBotAdded(data);
      expect(mockServer.emit).toHaveBeenCalledWith('bot:added', data);
    });

    it('emits bot:removed on bot.removed event', () => {
      const data = { id: 1 };
      gateway.handleBotRemoved(data);
      expect(mockServer.emit).toHaveBeenCalledWith('bot:removed', data);
    });
  });

  describe('broadcastState', () => {
    it('emits state:updated with the state payload', () => {
      const state = { orders: [], queue: [], bots: [] };
      gateway.broadcastState(state);
      expect(mockServer.emit).toHaveBeenCalledWith('state:updated', state);
    });
  });
});
