import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PostgresDatabaseModule } from '@libs/common/src';
import { UserRepository } from './repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/address.entity';
import { InternationalizationModule } from '@libs/common/src/internationalization/internationalization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.development.example', '.env.production', '.env.production.example'],
      isGlobal: true,
    }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([User, UserAddress]),
    InternationalizationModule
  ],
  controllers: [AppController],
  providers: [AppService, UserRepository],
})
export class AppModule {}
