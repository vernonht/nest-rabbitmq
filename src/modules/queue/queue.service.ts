import { Injectable } from '@nestjs/common';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';
import { OrderService } from '../order/order.service';

@Injectable()
export class QueueService {
  private readonly queue: Order[] = [];

  constructor(private readonly orderService: OrderService) {}

  enqueue(order: Order): Order {
    const normalizedOrder = { ...order };
    this.insertAtQueue(normalizedOrder, false);
    return normalizedOrder;
  }

  enqueueFront(order: Order): Order {
    const normalizedOrder = { ...order };
    this.insertAtQueue(normalizedOrder, true);
    return normalizedOrder;
  }

  dequeue(): Order | undefined {
    const order = this.queue.shift();
    if (order) {
      void this.orderService.updateStatus(order.id, OrderStatus.ASSIGNED);
    }
    return order;
  }

  peek(): Order | undefined {
    return this.queue[0];
  }

  getQueue(): Order[] {
    return [...this.queue];
  }

  private insertAtQueue(order: Order, front: boolean): void {
    const index = this.findInsertionIndex(order, front);
    this.queue.splice(index, 0, order);
  }

  private findInsertionIndex(order: Order, front: boolean): number {
    const firstNormal = this.queue.findIndex((queuedOrder) => queuedOrder.orderType === OrderType.NORMAL);

    if (front) {
      if (order.orderType === OrderType.VIP && firstNormal >= 0) {
        return firstNormal;
      }
      return 0;
    }

    if (order.orderType === OrderType.VIP) {
      if (firstNormal >= 0) {
        return firstNormal;
      }
      return this.queue.length;
    }

    return this.queue.length;
  }
}
