import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      status: OrderStatus.PENDING,
      priority: createOrderDto.orderType === OrderType.VIP ? 0 : 1,
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['jobs'] });
  }

  async findOne(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id }, relations: ['jobs'] });
  }

  async findPending(): Promise<Order[]> {
    return this.orderRepository.find({ where: { status: OrderStatus.PENDING }, relations: ['jobs'] });
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
