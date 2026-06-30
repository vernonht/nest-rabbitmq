import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { OrderService } from '../order/order.service';
import { BotService } from '../bot/bot.service';
import { QueueService } from '../queue/queue.service';
import { Order } from '../../entities/order.entity';
import { Bot } from '../../entities/bot.entity';

@Injectable()
export class ControllerService {
  constructor(
    private readonly orderService: OrderService,
    private readonly queueService: QueueService,
    private readonly botService: BotService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderService.create(createOrderDto);
    this.queueService.enqueue(order);
    return order;
  }

  async addBot(name: string): Promise<Bot> {
    return this.botService.createBot(name);
  }

  async removeBot(id: number): Promise<void> {
    await this.botService.remove(id);
  }

  async getState(): Promise<{ orders: Order[]; queue: Order[]; bots: Bot[] }> {
    const [orders, bots] = await Promise.all([this.orderService.findAll(), this.botService.findAll()]);

    return {
      orders,
      queue: this.queueService.getQueue(),
      bots,
    };
  }
}
