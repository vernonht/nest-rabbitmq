import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Bot } from './bot.entity';
import { Order } from './order.entity';

export enum BotJobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({ name: 'bot_jobs' })
export class BotJob {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.jobs, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Bot, (bot) => bot.jobs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bot_id' })
  bot: Bot | null;

  @Column({ type: 'enum', enum: BotJobStatus, default: BotJobStatus.QUEUED })
  status: BotJobStatus;

  @CreateDateColumn({ name: 'queued_at' })
  queuedAt: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
