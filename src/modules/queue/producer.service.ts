import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { RabbitMQService } from './rabbitmq.service';

export interface JobData {
  orderId: number;
  orderType: string;
  payload: string | null;
}

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async emitOrderJob(order: Order): Promise<void> {
    const channel = this.rabbitMQService.getChannel();

    if (!channel) {
      this.logger.warn(`Order ${order.id} queued but RabbitMQ not connected`);
      return;
    }

    const jobData: JobData = {
      orderId: order.id,
      orderType: order.orderType,
      payload: order.payload || '',
    };

    try {
      await channel.sendToQueue(
        'orders.process',
        Buffer.from(JSON.stringify(jobData)),
        { persistent: true },
      );
      this.logger.log(`Order ${order.id} emitted to queue`);
    } catch (error) {
      this.logger.error(
        `Failed to emit order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
