import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { QueueService } from './queue.service';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [OrderModule],
  providers: [QueueService, ProducerService, ConsumerService, RabbitMQService],
  exports: [QueueService, ProducerService, ConsumerService, RabbitMQService],
})
export class QueueModule {}
