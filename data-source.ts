import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Bot } from './src/entities/bot.entity';
import { BotJob } from './src/entities/bot-job.entity';
import { Order } from './src/entities/order.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'nest_rabbitmq',
  entities: [Order, Bot, BotJob],
  migrations: ['./src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
