import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerService } from './consumer.service';
import { RabbitMQService } from './rabbitmq.service';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../../entities/order.entity';
import type { JobData } from './producer.service';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let orderService: jest.Mocked<OrderService>;
  let rabbitMQService: jest.Mocked<RabbitMQService>;

  const mockJobData: JobData = {
    orderId: 1,
    orderType: 'NORMAL',
    payload: 'test',
  };

  beforeEach(async () => {
    jest.useFakeTimers();

    orderService = {
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderService>;

    rabbitMQService = {
      isConnected: jest.fn(),
      getChannel: jest.fn(),
    } as unknown as jest.Mocked<RabbitMQService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        { provide: OrderService, useValue: orderService },
        { provide: RabbitMQService, useValue: rabbitMQService },
      ],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('handleOrderProcessing', () => {
    it('marks order as COMPLETE on success', async () => {
      orderService.updateStatus.mockResolvedValue({} as any);
      const handleMethod = (service as any).handleOrderProcessing.bind(service);

      const promise = handleMethod(mockJobData);

      // Advance past the 10s processing simulation
      jest.advanceTimersByTime(10000);
      await promise;

      expect(orderService.updateStatus).toHaveBeenCalledWith(
        1,
        OrderStatus.COMPLETE,
      );
    });

    it('re-throws error when processing fails', async () => {
      orderService.updateStatus.mockRejectedValue(new Error('DB error'));
      const handleMethod = (service as any).handleOrderProcessing.bind(service);

      const promise = handleMethod(mockJobData);
      jest.advanceTimersByTime(10000);

      await expect(promise).rejects.toThrow('DB error');
    });
  });

  describe('onModuleInit', () => {
    it('delays consumer startup by 1 second', () => {
      rabbitMQService.isConnected.mockReturnValue(true);
      rabbitMQService.getChannel.mockReturnValue({
        consume: jest.fn().mockResolvedValue(undefined as never),
      } as any);

      const consumeSpy = jest.spyOn(service as any, 'startConsuming');

      (service as any).onModuleInit();

      expect(consumeSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(consumeSpy).toHaveBeenCalled();
    });
  });
});
