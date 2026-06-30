import { Module } from '@nestjs/common';
import { BotModule } from '../bot/bot.module';
import { OrderModule } from '../order/order.module';
import { QueueModule } from '../queue/queue.module';
import { ControllerService } from './controller.service';

@Module({
  imports: [OrderModule, QueueModule, BotModule],
  providers: [ControllerService],
  exports: [ControllerService],
})
export class ControllerModule {}
