import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Bot } from './entities/bot.entity';
import { BotJob } from './entities/bot-job.entity';
import { Order } from './entities/order.entity';
import { BotModule } from './modules/bot/bot.module';
import { ControllerModule } from './modules/controller/controller.module';
import { OrderModule } from './modules/order/order.module';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 5432)),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'nest_rabbitmq'),
        entities: [Order, Bot, BotJob],
        synchronize: false,
        logging: false,
      }),
    }),
    OrderModule,
    QueueModule,
    BotModule,
    ControllerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
