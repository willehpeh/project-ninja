import { Module } from '@nestjs/common';
import { EventStoreModule } from '@ninja-4-vs/infrastructure';
import { CqrsModule } from '@nestjs/cqrs';
import { TeamModule } from './delivery/teams/team.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    EventStoreModule.forRoot({
      basePath: './data'
    }),
    TeamModule
  ]
})
export class AppModule {
}
