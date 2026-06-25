import { Body, Controller, Get, Param, Post, Query, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO } from '@libs/shared/src';

@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() dto: CreateProductDTO) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get('search')
  async searchProducts(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.productsService.searchProducts(query);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }
}
