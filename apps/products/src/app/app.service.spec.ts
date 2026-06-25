import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ProductRepository } from './repositories/product.repository';
import { ElasticsearchService } from './services/elasticsearch.service';
import { RedisService } from '@libs/common/src';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ProductRepository,
          useValue: {
            createProduct: jest.fn(),
            findAllProducts: jest.fn(),
            findProductById: jest.fn(),
          },
        },
        {
          provide: ElasticsearchService,
          useValue: {
            indexProduct: jest.fn(),
            searchProducts: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
