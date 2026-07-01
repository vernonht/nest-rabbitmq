import { QueueService } from './queue.service';
import { OrderService } from '../order/order.service';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';

describe('QueueService', () => {
  it('keeps VIP orders ahead of normal orders', () => {
    const orderService = { updateStatus: jest.fn() };
    const service = new QueueService(orderService as unknown as OrderService);

    const vip1 = {
      id: 1,
      orderType: OrderType.VIP,
      status: OrderStatus.PENDING,
    } as Order;
    const normal1 = {
      id: 2,
      orderType: OrderType.NORMAL,
      status: OrderStatus.PENDING,
    } as Order;
    const vip2 = {
      id: 3,
      orderType: OrderType.VIP,
      status: OrderStatus.PENDING,
    } as Order;

    service.enqueue(vip1);
    service.enqueue(normal1);
    service.enqueue(vip2);

    expect(service.getQueue()).toEqual([vip1, vip2, normal1]);
    expect(service.dequeue()).toEqual(vip1);
    expect(service.dequeue()).toEqual(vip2);
    expect(service.dequeue()).toEqual(normal1);
  });
});
