import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import type { Message } from 'amqplib';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../../entities/order.entity';
import { RabbitMQService } from './rabbitmq.service';
import { JobData } from './producer.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  onModuleInit(): void {
    // Delay startup of consumer to allow RabbitMQ to connect
    setTimeout(() => {
      void this.startConsuming();
    }, 1000);
  }

  private async startConsuming(): Promise<void> {
    if (!this.rabbitMQService.isConnected()) {
      this.logger.warn('RabbitMQ not connected, consumer will not start');
      return;
    }

    const channel = this.rabbitMQService.getChannel();
    if (!channel) {
      this.logger.warn('RabbitMQ channel not available');
      return;
    }

    try {
      await channel.consume(
        'orders.process',
        (msg: Message | null) => {
          void (async () => {
            if (!msg) return;

            try {
              const jobData = JSON.parse(msg.content.toString()) as JobData;
              await this.handleOrderProcessing(jobData);
              // Acknowledge the message after successful processing
              channel.ack(msg);
            } catch (error) {
              this.logger.error(
                `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
              // Nack and requeue on error
              channel.nack(msg, false, true);
            }
          })();
        },
        { noAck: false },
      );

      this.logger.log('Started consuming from orders.process queue');
    } catch (error) {
      this.logger.error(
        `Failed to start consumer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleOrderProcessing(jobData: JobData): Promise<void> {
    const { orderId, orderType, payload } = jobData;
    this.logger.log(
      `Processing order ${orderId} (type: ${orderType}, payload: ${payload})...`,
    );

    try {
      // Simulate 10s processing
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Mark order as complete
      await this.orderService.updateStatus(orderId, OrderStatus.COMPLETE);
      this.logger.log(`Order ${orderId} completed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to process order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
