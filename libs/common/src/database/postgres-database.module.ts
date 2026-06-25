import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST') ?? '127.0.0.1',
        port: configService.get<number>('POSTGRES_PORT') ?? 5432,
        username: configService.get<string>('POSTGRES_USER') ?? 'postgres',
        password: configService.get<string>('POSTGRES_PASSWORD') ?? 'postgrespassword',
        database: configService.get<string>('POSTGRES_DB') ?? 'postgres_db',
        autoLoadEntities: true,
        synchronize: true, // Note: synchronize should be false in production, but is standard for dev/portfolio demo
      }),
      inject: [ConfigService],
    }),
  ],
})
export class PostgresDatabaseModule {}
