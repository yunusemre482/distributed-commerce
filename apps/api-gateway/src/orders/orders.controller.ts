import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDTO } from '@libs/shared/src';

@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDTO) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }
}
