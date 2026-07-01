import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import type {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import type { Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private connected = false;

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

    try {
      this.connection = amqp.connect([rabbitmqUrl], {
        connectionOptions: {
          clientProperties: { connection_name: 'nestjs-rabbitmq' },
        },
      });

      this.connection.on('connect', () => {
        this.logger.log('Connected to RabbitMQ');
        this.connected = true;
      });

      this.connection.on('disconnect', (err: unknown) => {
        this.logger.error(
          `Disconnected from RabbitMQ: ${err instanceof Error ? err.message : String(err)}`,
        );
        this.connected = false;
      });

      this.channel = this.connection.createChannel({
        setup: async (channel: Channel) => {
          // Declare exchange and queue
          await channel.assertExchange('orders', 'direct', { durable: true });
          await channel.assertQueue('orders.process', { durable: true });
          await channel.bindQueue('orders.process', 'orders', 'process');
        },
      });

      await this.channel.waitForConnect();
      this.connected = true;
      this.logger.log('RabbitMQ channel connected');
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Continue without RabbitMQ for now (graceful degradation)
      this.connected = false;
    }
  }

  private async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connected = false;
      this.logger.log('Disconnected from RabbitMQ');
    }
  }

  getChannel(): ChannelWrapper | null {
    return this.connected ? this.channel : null;
  }

  getConnection(): AmqpConnectionManager | null {
    return this.connected ? this.connection : null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
