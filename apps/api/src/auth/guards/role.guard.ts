import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/auth/decorators/public.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private i18n: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(this.i18n.t('errors.auth.no-user-found'));
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        this.i18n.t('errors.auth.you-are-not-allowed-to-do-this'),
      );
    }

    return true;
  }
}
