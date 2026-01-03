import { Module } from '@nestjs/common';
import { EventStoreModule } from '@ninja-4-vs/infrastructure';
import { CqrsModule } from '@nestjs/cqrs';
import { TeamModule } from './delivery/teams/team.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    CqrsModule.forRoot(),
    EventStoreModule.forRoot({
      basePath: './data'
    }),
    TeamModule
  ],
  exports: [
    EventStoreModule
  ]
})
export class AppModule {
}
