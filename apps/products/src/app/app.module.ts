import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@libs/common/src';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '@libs/models/src';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.development.example', '.env.production', '.env.production.example'],
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, ProductRepository],
})
export class AppModule {}
