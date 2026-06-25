import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDERS_SERVICE } from '@libs/constants/src';
import { CreateOrderDTO } from '@libs/shared/src';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  async createOrder(dto: CreateOrderDTO) {
    return this.orderClient.send('createOrder', dto);
  }

  async getAllOrders() {
    return this.orderClient.send('getAllOrders', {});
  }
}
