import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDTO } from '@libs/shared/src';
import { ElasticsearchService } from './services/elasticsearch.service';
import { RedisService } from '@libs/common/src';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly redisService: RedisService,
  ) {}

  async createProduct(dto: CreateProductDTO) {
    const product = await this.productRepository.createProduct(dto);
    
    this.elasticsearchService.indexProduct(product._id.toString(), product).catch((err) => {
      this.logger.error(`Failed to index product ${product._id} in Elasticsearch`, err);
    });

    return product;
  }

  async getAllProducts() {
    return this.productRepository.findAllProducts();
  }

  async getProductById(id: string) {
    const cacheKey = `product:${id}`;
    
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for product ${id}`);
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.error(`Redis cache read failed for product ${id}`, err);
    }

    this.logger.log(`Cache miss for product ${id}. Fetching from MongoDB...`);
    const product = await this.productRepository.findProductById(id);
    
    if (product) {
      try {
        await this.redisService.set(cacheKey, JSON.stringify(product), 600);
      } catch (err) {
        this.logger.error(`Failed to cache product ${id} in Redis`, err);
      }
    }

    return product;
  }

  async searchProducts(query: string) {
    return this.elasticsearchService.searchProducts(query);
  }
}
