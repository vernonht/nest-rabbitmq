import { Test, TestingModule } from '@nestjs/testing';
import { BotsController } from './bot.controller';
import { ControllerService } from '../controller/controller.service';
import { Bot } from '../../entities/bot.entity';

describe('BotsController', () => {
  let controller: BotsController;
  let controllerService: jest.Mocked<ControllerService>;

  const mockBot = {
    id: 1,
    name: 'test-bot',
    active: true,
  } as Bot;

  beforeEach(async () => {
    controllerService = {
      addBot: jest.fn(),
      findAllBots: jest.fn(),
      removeBot: jest.fn(),
    } as unknown as jest.Mocked<ControllerService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotsController],
      providers: [{ provide: ControllerService, useValue: controllerService }],
    }).compile();

    controller = module.get<BotsController>(BotsController);
  });

  describe('POST /bots', () => {
    it('calls controllerService.addBot and returns the bot', async () => {
      controllerService.addBot.mockResolvedValue(mockBot);

      const result = await controller.create({ name: 'test-bot' });

      expect(controllerService.addBot).toHaveBeenCalledWith('test-bot');
      expect(result).toEqual(mockBot);
    });
  });

  describe('GET /bots', () => {
    it('returns all bots', async () => {
      controllerService.findAllBots.mockResolvedValue([mockBot]);

      const result = await controller.findAll();

      expect(controllerService.findAllBots).toHaveBeenCalled();
      expect(result).toEqual([mockBot]);
    });
  });

  describe('DELETE /bots/:id', () => {
    it('calls controllerService.removeBot with the id', async () => {
      controllerService.removeBot.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(controllerService.removeBot).toHaveBeenCalledWith(1);
    });
  });
});
