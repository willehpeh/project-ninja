import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { CLS_USER_ID } from './cls-auth-context';

@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'] ?? 'anonymous';
    this.cls.set(CLS_USER_ID, userId);
    return next.handle();
  }
}
