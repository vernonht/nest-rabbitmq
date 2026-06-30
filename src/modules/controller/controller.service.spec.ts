import { ControllerService } from './controller.service';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';

describe('ControllerService', () => {
  it('creates an order and enqueues it for processing', async () => {
    const orderService = {
      create: jest.fn().mockResolvedValue({ id: 10, orderType: OrderType.NORMAL, status: OrderStatus.PENDING } as Order),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as any;
    const queueService = {
      enqueue: jest.fn(),
      getQueue: jest.fn().mockReturnValue([]),
    } as any;
    const botService = {
      getActiveBots: jest.fn().mockReturnValue([]),
      remove: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    } as any;

    const service = new ControllerService(orderService, queueService, botService);
    const result = await service.createOrder({ orderType: OrderType.NORMAL, payload: 'hello' } as any);

    expect(orderService.create).toHaveBeenCalled();
    expect(queueService.enqueue).toHaveBeenCalledWith(result);
    expect(result.status).toBe(OrderStatus.PENDING);
  });
});
