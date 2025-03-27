import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { UserDto } from '@/auth/dto/account.dto';
import { Role } from '@/constants/type';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: UserDto) {
    let user;

    if (payload.role === Role.Guest) {
      user = await this.prisma.guest.findUnique({
        where: { id: payload.id },
      });
    } else {
      user = await this.prisma.account.findUnique({
        where: { id: payload.id },
      });
    }

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('errors.auth.not-found'));
    }

    return payload;
  }
}
