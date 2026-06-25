import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '@libs/constants/src';
import { CreateProductDTO } from '@libs/shared/src';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  async createProduct(dto: CreateProductDTO) {
    return this.productClient.send('createProduct', dto);
  }

  async getAllProducts() {
    return this.productClient.send('getAllProducts', {});
  }

  async getProductById(id: string) {
    return this.productClient.send('getProductById', id);
  }

  async searchProducts(query: string) {
    return this.productClient.send('searchProducts', { query });
  }
}
