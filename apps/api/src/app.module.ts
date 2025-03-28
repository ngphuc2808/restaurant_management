//libs
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
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
