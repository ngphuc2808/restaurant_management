//libs
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import * as path from 'path';

//app
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaService } from '@/prisma.service';

//modules
import { AuthModule } from '@/auth/auth.module';
import { AccountModule } from '@/account/account.module';
import { SocketModule } from '@/socket/socket.module';
import { RefreshTokenModule } from '@/refresh-token/refresh-token.module';
import { TableModule } from '@/table/table.module';
import { OrderModule } from '@/order/order.module';
import { GuestModule } from '@/guest/guest.module';
import { DishModule } from '@/dish/dish.module';
import { IndicatorModule } from '@/indicator/indicator.module';

//services

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: 'vi',
        loaderOptions: {
          path: path.join(__dirname, '/../src/i18n/'),
          watch: true,
        },
      }),
      resolvers: [new HeaderResolver(['locale'])],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.getOrThrow('REDIS_HOST') || 'localhost',
        port: configService.getOrThrow('REDIS_PORT') || 6379,
        db: configService.getOrThrow('REDIS_DB_INDEX') || 1,
        max: 5000,
        ttl: 3600,
        options: { prefix: '' },
      }),
    }),
    AuthModule,
    IndicatorModule,
    AccountModule,
    DishModule,
    GuestModule,
    OrderModule,
    TableModule,
    RefreshTokenModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
