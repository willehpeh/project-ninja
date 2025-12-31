import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { AddTeamCommandHandler } from '@ninja-4-vs/application';

@Module({
  imports: [CqrsModule],
  controllers: [TeamController],
  providers: [
    TeamService,
    AddTeamCommandHandler
  ],
})
export class TeamModule {}
