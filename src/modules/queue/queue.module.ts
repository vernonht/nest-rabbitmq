import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { QueueService } from './queue.service';

@Module({
  imports: [OrderModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
