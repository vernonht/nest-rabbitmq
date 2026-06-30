import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '../../entities/bot.entity';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
  ) {}

  async createBot(name: string): Promise<Bot> {
    const bot = this.botRepository.create({ name, active: true });
    return this.botRepository.save(bot);
  }

  async findAll(): Promise<Bot[]> {
    return this.botRepository.find();
  }

  async getActiveBots(): Promise<Bot[]> {
    return this.botRepository.find({ where: { active: true } });
  }

  async remove(id: number): Promise<void> {
    await this.botRepository.update(id, { active: false });
  }
}
