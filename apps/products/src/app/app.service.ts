import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDTO } from '@libs/shared/src';
import { ElasticsearchService } from './services/elasticsearch.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async createProduct(dto: CreateProductDTO) {
    const product = await this.productRepository.createProduct(dto);
    
    // Index product asynchronously in Elasticsearch
    this.elasticsearchService.indexProduct(product._id.toString(), product).catch((err) => {
      this.logger.error(`Failed to index product ${product._id} in Elasticsearch`, err);
    });

    return product;
  }

  async getAllProducts() {
    return this.productRepository.findAllProducts();
  }

  async getProductById(id: string) {
    return this.productRepository.findProductById(id);
  }

  async searchProducts(query: string) {
    return this.elasticsearchService.searchProducts(query);
  }
}
