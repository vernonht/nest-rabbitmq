import { Test, TestingModule } from '@nestjs/testing';
import { ProducerService } from './producer.service';
import { RabbitMQService } from './rabbitmq.service';
import { Order, OrderType, OrderStatus } from '../../entities/order.entity';

describe('ProducerService', () => {
  let service: ProducerService;
  let rabbitMQService: jest.Mocked<RabbitMQService>;

  const mockOrder = {
    id: 1,
    orderType: OrderType.NORMAL,
    status: OrderStatus.PENDING,
    payload: 'test-payload',
    priority: 1,
  } as Order;

  beforeEach(async () => {
    rabbitMQService = {
      getChannel: jest.fn(),
    } as unknown as jest.Mocked<RabbitMQService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        { provide: RabbitMQService, useValue: rabbitMQService },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
  });

  describe('emitOrderJob', () => {
    it('sends job data to the orders.process queue', async () => {
      const channel = { sendToQueue: jest.fn().mockResolvedValue(undefined) };
      rabbitMQService.getChannel.mockReturnValue(channel as any);

      await service.emitOrderJob(mockOrder);

      expect(rabbitMQService.getChannel).toHaveBeenCalled();
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'orders.process',
        expect.any(Buffer),
        { persistent: true },
      );

      const sentBuffer = channel.sendToQueue.mock.calls[0][1] as Buffer;
      const sentData = JSON.parse(sentBuffer.toString());
      expect(sentData).toEqual({
        orderId: 1,
        orderType: OrderType.NORMAL,
        payload: 'test-payload',
      });
    });

    it('logs a warning when RabbitMQ is not connected', async () => {
      rabbitMQService.getChannel.mockReturnValue(null);
      const loggerWarn = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation();

      await service.emitOrderJob(mockOrder);

      expect(loggerWarn).toHaveBeenCalledWith(
        expect.stringContaining('RabbitMQ not connected'),
      );
      loggerWarn.mockRestore();
    });
  });
});
