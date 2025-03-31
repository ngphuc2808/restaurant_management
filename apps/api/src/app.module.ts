//libs
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as path from 'path';

//app
import { AppController } from '@/app.controller';

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
import { PrismaService } from '@/prisma.service';
import { AppService } from '@/app.service';

//utils
import { RedisOptions } from '@/utils/redis.configuration';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisOptions),
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
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    PrismaService,
    AppService,
  ],
})
export class AppModule {}
