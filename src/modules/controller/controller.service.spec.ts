import { ControllerService } from './controller.service';
import { OrderStatus, OrderType } from '../../entities/order.entity';
import { OrderService } from '../order/order.service';
import { QueueService } from '../queue/queue.service';
import { BotService } from '../bot/bot.service';
import { ProducerService } from '../queue/producer.service';

describe('ControllerService', () => {
  it('creates an order and enqueues it for processing', async () => {
    const createMock = jest.fn().mockResolvedValue({
      id: 10,
      orderType: OrderType.NORMAL,
      status: OrderStatus.PENDING,
    });
    const findAllMock = jest.fn();
    const findOneMock = jest.fn();
    const orderService = {
      create: createMock,
      findAll: findAllMock,
      findOne: findOneMock,
    } as unknown as OrderService;
    const enqueueMock = jest.fn();
    const getQueueMock = jest.fn().mockReturnValue([]);
    const queueService = {
      enqueue: enqueueMock,
      getQueue: getQueueMock,
    } as unknown as QueueService;
    const botService = {
      getActiveBots: jest.fn().mockReturnValue([]),
      remove: jest.fn(),
      findAll: jest.fn(),
      createBot: jest.fn(),
    } as unknown as BotService;
    const producerService = {
      emitOrderJob: jest.fn(),
    } as unknown as ProducerService;

    const service = new ControllerService(
      orderService,
      queueService,
      botService,
      producerService,
    );
    const result = await service.createOrder({
      orderType: OrderType.NORMAL,
      payload: 'hello',
    });

    expect(createMock).toHaveBeenCalled();
    expect(enqueueMock).toHaveBeenCalledWith(result);
    expect(result.status).toBe(OrderStatus.PENDING);
  });
});
