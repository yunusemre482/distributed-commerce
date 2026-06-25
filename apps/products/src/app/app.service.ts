import { Injectable } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDTO } from '@libs/shared/src';

@Injectable()
export class AppService {
  constructor(private readonly productRepository: ProductRepository) {}

  async createProduct(dto: CreateProductDTO) {
    return this.productRepository.createProduct(dto);
  }

  async getAllProducts() {
    return this.productRepository.findAllProducts();
  }

  async getProductById(id: string) {
    return this.productRepository.findProductById(id);
  }
}
