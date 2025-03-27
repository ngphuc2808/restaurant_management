import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import queryString from 'query-string';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private configService: ConfigService,
    private i18n: I18nService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { error } = request.query;

    if (error === 'access_denied') {
      const res = context.switchToHttp().getResponse();

      const qs = queryString.stringify({
        message: this.i18n.t('errors.auth.login-failed'),
      });

      const clientRedirectUrl = this.configService.get(
        'GOOGLE_REDIRECT_CLIENT_URL',
      );

      res.redirect(`${clientRedirectUrl}?${qs}`);

      return false;
    }

    return super.canActivate(context);
  }
}
