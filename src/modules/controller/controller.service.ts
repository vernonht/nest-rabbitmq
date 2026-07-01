import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { OrderService } from '../order/order.service';
import { BotService } from '../bot/bot.service';
import { QueueService } from '../queue/queue.service';
import { ProducerService } from '../queue/producer.service';
import { Order, OrderStatus } from '../../entities/order.entity';
import { Bot } from '../../entities/bot.entity';

@Injectable()
export class ControllerService implements OnModuleInit {
  constructor(
    private readonly orderService: OrderService,
    private readonly queueService: QueueService,
    private readonly botService: BotService,
    private readonly producerService: ProducerService,
  ) {}

  onModuleInit() {
    // Trigger initial processing of any pending orders
    void this.processQueuedOrders();
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderService.create(createOrderDto);
    this.queueService.enqueue(order);
    // Immediately try to process queued orders
    void this.processQueuedOrders();
    return order;
  }

  async addBot(name: string): Promise<Bot> {
    const bot = await this.botService.createBot(name);
    // When a new bot is added, process queued orders
    void this.processQueuedOrders();
    return bot;
  }

  async removeBot(id: number): Promise<void> {
    await this.botService.remove(id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }
    return order;
  }

  async findAllBots(): Promise<Bot[]> {
    return this.botService.findAll();
  }

  async getState(): Promise<{ orders: Order[]; queue: Order[]; bots: Bot[] }> {
    const [orders, bots] = await Promise.all([
      this.orderService.findAll(),
      this.botService.findAll(),
    ]);

    return {
      orders,
      queue: this.queueService.getQueue(),
      bots,
    };
  }

  async assignOrderToBot(orderId: number): Promise<void> {
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Update status to ASSIGNED before emitting to producer
    await this.orderService.updateStatus(orderId, OrderStatus.ASSIGNED);

    // Emit to producer queue for async processing
    await this.producerService.emitOrderJob(order);
  }

  private async processQueuedOrders(): Promise<void> {
    const activeBots = await this.botService.getActiveBots();

    if (activeBots.length === 0) {
      return;
    }

    const queuedOrders = this.queueService.getQueue();

    for (const order of queuedOrders) {
      const currentOrder = await this.orderService.findOne(order.id);
      if (currentOrder && currentOrder.status === OrderStatus.PENDING) {
        await this.assignOrderToBot(order.id);
        this.queueService.dequeue();
      }
    }
  }
}
