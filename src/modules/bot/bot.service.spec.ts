import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotService } from './bot.service';
import { Bot } from '../../entities/bot.entity';

describe('BotService', () => {
  let service: BotService;
  let repo: jest.Mocked<Repository<Bot>>;

  const mockBot = {
    id: 1,
    name: 'test-bot',
    active: true,
    createdAt: new Date(),
  } as Bot;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        { provide: getRepositoryToken(Bot), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<BotService>(BotService);
    repo = module.get(getRepositoryToken(Bot));
  });

  describe('createBot', () => {
    it('creates a bot with active:true', async () => {
      repo.create.mockReturnValue(mockBot);
      repo.save.mockResolvedValue(mockBot);

      const result = await service.createBot('test-bot');

      expect(repo.create).toHaveBeenCalledWith({
        name: 'test-bot',
        active: true,
      });
      expect(repo.save).toHaveBeenCalledWith(mockBot);
      expect(result).toEqual(mockBot);
    });
  });

  describe('findAll', () => {
    it('returns all bots', async () => {
      repo.find.mockResolvedValue([mockBot]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual([mockBot]);
    });
  });

  describe('getActiveBots', () => {
    it('returns only active bots', async () => {
      repo.find.mockResolvedValue([mockBot]);

      const result = await service.getActiveBots();

      expect(repo.find).toHaveBeenCalledWith({
        where: { active: true },
      });
      expect(result).toEqual([mockBot]);
    });
  });

  describe('remove', () => {
    it('soft-deletes a bot by setting active to false', async () => {
      repo.update.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(repo.update).toHaveBeenCalledWith(1, { active: false });
    });
  });
});
