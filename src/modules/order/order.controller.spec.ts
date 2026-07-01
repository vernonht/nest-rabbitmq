import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { ControllerService } from '../controller/controller.service';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let controllerService: jest.Mocked<ControllerService>;

  const mockOrder = {
    id: 1,
    orderType: OrderType.NORMAL,
    status: OrderStatus.PENDING,
    payload: 'test',
    priority: 1,
  } as Order;

  beforeEach(async () => {
    controllerService = {
      createOrder: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<ControllerService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: ControllerService, useValue: controllerService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  describe('POST /orders', () => {
    it('calls controllerService.createOrder and returns the order', async () => {
      controllerService.createOrder.mockResolvedValue(mockOrder);
      const dto = { orderType: OrderType.NORMAL, payload: 'test' };

      const result = await controller.create(dto);

      expect(controllerService.createOrder).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('GET /orders', () => {
    it('returns all orders', async () => {
      controllerService.findAll.mockResolvedValue([mockOrder]);

      const result = await controller.findAll();

      expect(controllerService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('GET /orders/:id', () => {
    it('returns a single order by id', async () => {
      controllerService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne('1');

      expect(controllerService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });
  });
});
