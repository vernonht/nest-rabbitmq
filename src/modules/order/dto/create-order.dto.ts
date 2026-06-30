import { OrderType } from '../../../entities/order.entity';

export class CreateOrderDto {
  orderType: OrderType = OrderType.NORMAL;
  payload?: string;
}
