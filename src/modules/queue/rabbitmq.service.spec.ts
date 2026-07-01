import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from './rabbitmq.service';

describe('RabbitMQService', () => {
  let service: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitMQService],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with connected = false and no channel/connection', () => {
      expect(service.isConnected()).toBe(false);
      expect(service.getChannel()).toBeNull();
      expect(service.getConnection()).toBeNull();
    });
  });

  describe('onModuleInit / connect', () => {
    it('calls connect on init', async () => {
      const connectSpy = jest
        .spyOn(service as any, 'connect')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy / disconnect', () => {
    it('calls disconnect on destroy', async () => {
      const disconnectSpy = jest
        .spyOn(service as any, 'disconnect')
        .mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('isConnected / getChannel / getConnection', () => {
    it('returns null getters when not connected', () => {
      expect(service.getChannel()).toBeNull();
      expect(service.getConnection()).toBeNull();
    });
  });
});
