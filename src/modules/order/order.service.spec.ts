import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from './order.service';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let repo: jest.Mocked<Repository<Order>>;

  const mockOrder = {
    id: 1,
    orderType: OrderType.NORMAL,
    status: OrderStatus.PENDING,
    priority: 1,
    payload: 'test-payload',
    createdAt: new Date(),
    updatedAt: new Date(),
    jobs: [],
  } as unknown as Order;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repo = module.get(getRepositoryToken(Order));
  });

  describe('create', () => {
    it('creates an order with PENDING status and correct priority', async () => {
      const dto: CreateOrderDto = {
        orderType: OrderType.NORMAL,
        payload: 'test',
      };

      repo.create.mockReturnValue(mockOrder);
      repo.save.mockResolvedValue(mockOrder);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        status: OrderStatus.PENDING,
        priority: 1,
      });
      expect(repo.save).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual(mockOrder);
    });

    it('sets priority 0 for VIP orders', async () => {
      const dto: CreateOrderDto = { orderType: OrderType.VIP };
      const vipOrder = { ...mockOrder, orderType: OrderType.VIP, priority: 0 };

      repo.create.mockReturnValue(vipOrder);
      repo.save.mockResolvedValue(vipOrder);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 0, orderType: OrderType.VIP }),
      );
      expect(result.priority).toBe(0);
    });
  });

  describe('findAll', () => {
    it('returns all orders', async () => {
      repo.find.mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith();
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findOne', () => {
    it('returns an order by id', async () => {
      repo.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockOrder);
    });

    it('returns null when order not found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findPending', () => {
    it('returns only PENDING orders', async () => {
      repo.find.mockResolvedValue([mockOrder]);

      const result = await service.findPending();

      expect(repo.find).toHaveBeenCalledWith({
        where: { status: OrderStatus.PENDING },
      });
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('updateStatus', () => {
    it('updates and returns the order', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.ASSIGNED };
      repo.findOne.mockResolvedValue(mockOrder);
      repo.save.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus(1, OrderStatus.ASSIGNED);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.ASSIGNED }),
      );
      expect(result.status).toBe(OrderStatus.ASSIGNED);
    });

    it('throws NotFoundException when order does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, OrderStatus.ASSIGNED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
