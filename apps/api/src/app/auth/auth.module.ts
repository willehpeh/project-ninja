import { Global, Module } from '@nestjs/common';
import { AuthContext } from '@ninja-4-vs/application';
import { ClsAuthContext } from './cls-auth-context';
import { ClsModule } from 'nestjs-cls';
import { AuthContextInterceptor } from './auth-context.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      middleware: { mount: true }
    }),
  ],
  providers: [
    {
      provide: AuthContext,
      useClass: ClsAuthContext
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthContextInterceptor
    }
  ],
  exports: [AuthContext]
})
export class AuthModule {}
