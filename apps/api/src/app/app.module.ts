import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { AuthContext } from '@ninja-4-vs/application';
import { EventStoreModule } from '@ninja-4-vs/infrastructure';
import { CqrsModule } from '@nestjs/cqrs';
import { TeamModule } from './delivery/teams/team.module';
import { AuthContextInterceptor } from './auth/auth-context.interceptor';
import { ClsAuthContext } from './auth/cls-auth-context';

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: { mount: true }
    }),
    CqrsModule.forRoot(),
    EventStoreModule.forRoot({
      basePath: './data'
    }),
    TeamModule
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
  exports: [
    EventStoreModule
  ]
})
export class AppModule {
}
