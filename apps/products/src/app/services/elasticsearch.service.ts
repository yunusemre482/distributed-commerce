import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client!: Client;
  private readonly logger = new Logger(ElasticsearchService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const nodeUrl = this.configService.get<string>('ELASTICSEARCH_NODE') ?? 'http://elasticsearch:9200';
    this.client = new Client({ node: nodeUrl });
    this.logger.log(`Elasticsearch client initialized pointing to ${nodeUrl}`);
    this.createIndexIfNotExists().catch(err => {
      this.logger.error('Failed to initialize Elasticsearch index', err);
    });
  }

  private async createIndexIfNotExists() {
    const index = 'products';
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      this.logger.log(`Creating index '${index}' in Elasticsearch...`);
      await this.client.indices.create({
        index,
        mappings: {
          properties: {
            name: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            price: { type: 'double' },
            stock: { type: 'integer' },
            createdAt: { type: 'date' },
          },
        },
      });
    }
  }

  async indexProduct(productId: string, productData: any) {
    this.logger.log(`Indexing product ${productId} in Elasticsearch...`);
    await this.client.index({
      index: 'products',
      id: productId,
      document: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        createdAt: productData.createdAt || new Date(),
      },
    });
  }

  async searchProducts(query: string) {
    this.logger.log(`Searching products in Elasticsearch for query: "${query}"`);
    const result = await this.client.search({
      index: 'products',
      query: {
        multi_match: {
          query,
          fields: ['name^3', 'description'],
          fuzziness: 'AUTO',
        },
      },
    });

    return result.hits.hits.map(hit => ({
      id: hit._id,
      ...(hit._source as object),
    }));
  }
}
