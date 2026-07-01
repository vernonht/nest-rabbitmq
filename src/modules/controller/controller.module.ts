import { Module } from '@nestjs/common';
import { BotModule } from '../bot/bot.module';
import { OrderModule } from '../order/order.module';
import { QueueModule } from '../queue/queue.module';
import { ControllerService } from './controller.service';
import { OrdersController } from '../order/order.controller';
import { BotsController } from '../bot/bot.controller';

@Module({
  imports: [OrderModule, QueueModule, BotModule],
  providers: [ControllerService],
  controllers: [OrdersController, BotsController],
  exports: [ControllerService, QueueModule],
})
export class ControllerModule {}
