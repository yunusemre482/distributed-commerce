import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateProductDTO } from '@libs/shared/src';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @MessagePattern('createProduct')
  async createProduct(@Payload() payload: CreateProductDTO) {
    this.logger.log('Received createProduct request', payload);
    return this.appService.createProduct(payload);
  }

  @MessagePattern('getAllProducts')
  async getAllProducts() {
    this.logger.log('Received getAllProducts request');
    return this.appService.getAllProducts();
  }

  @MessagePattern('getProductById')
  async getProductById(@Payload() id: string) {
    this.logger.log(`Received getProductById request for id ${id}`);
    return this.appService.getProductById(id);
  }
}
