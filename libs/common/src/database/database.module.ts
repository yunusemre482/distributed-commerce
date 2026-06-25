import { Module, Logger } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log("database module environment MONGO_URI", configService.get<string>('MONGODB_URI'));
        console.log("database module environment MONGODB_DB_NAME", configService.get<string>('MONGODB_DB_NAME'));

        return {
          uri: configService.get<string>('MONGODB_URI'),
          dbName: configService.get<string>('MONGODB_DB_NAME'),
          maxPoolSize: 100,
          readPreference: 'secondaryPreferred',
          connectionFactory: (connection: Connection) => {
            if (connection.readyState === 1) {
              Logger.log('DB connected');
            }

            connection.on('disconnected', () => {
              Logger.log('DB disconnected');
            });

            return connection;
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule { }
