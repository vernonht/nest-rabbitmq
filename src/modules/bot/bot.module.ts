import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from '../../entities/bot.entity';
import { BotService } from './bot.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bot])],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
