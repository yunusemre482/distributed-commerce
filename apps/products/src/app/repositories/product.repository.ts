import { AbstractRepository } from '@libs/common/src/database/abstract.repository';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, QueryOptions, SaveOptions, UpdateQuery } from 'mongoose';
import { Product, ProductDocument } from '@libs/models/src/schemas/product.schema';

export class ProductRepository extends AbstractRepository<ProductDocument> {
  protected readonly logger = new Logger(ProductRepository.name);

  constructor(
    @InjectModel(Product.name)
    private readonly _productModel: Model<ProductDocument>,
    @InjectConnection()
    private readonly _connection: Connection,
  ) {
    super(_productModel, _connection);
  }

  async createProduct(
    product: Partial<Omit<ProductDocument, '_id'>>,
    options?: SaveOptions,
  ): Promise<ProductDocument> {
    return this.create(product, options);
  }

  async findProduct(
    filterQuery: FilterQuery<ProductDocument>,
    options?: QueryOptions,
  ): Promise<Partial<ProductDocument>> {
    return this.findOne(filterQuery, options);
  }

  async findAllProducts(options?: QueryOptions): Promise<ProductDocument[] | null> {
    return this.findAll(options);
  }

  async findProductById(productId: string): Promise<ProductDocument | null | undefined> {
    return this.findById(productId);
  }

  async updateProduct(
    filterQuery: FilterQuery<ProductDocument>,
    update: UpdateQuery<ProductDocument>,
    options?: QueryOptions
  ) {
    return this.findOneAndUpdate(filterQuery, update, options);
  }

  async deleteProduct(filterQuery: FilterQuery<ProductDocument>) {
    return this.deleteOne(filterQuery);
  }
}
