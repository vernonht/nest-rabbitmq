import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ControllerService } from './modules/controller/controller.service';

describe('AppController', () => {
  let appController: AppController;
  let controllerService: jest.Mocked<ControllerService>;

  beforeEach(async () => {
    controllerService = {
      getState: jest.fn(),
    } as unknown as jest.Mocked<ControllerService>;

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: ControllerService, useValue: controllerService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('GET /state', () => {
    it('returns the full system state', async () => {
      const mockState = { orders: [], queue: [], bots: [] };
      controllerService.getState.mockResolvedValue(mockState);

      const result = await appController.getState();

      expect(controllerService.getState).toHaveBeenCalled();
      expect(result).toEqual(mockState);
    });
  });
});
