import { Body, Controller, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { AddTeamDto } from './add-team.dto';

@Controller('teams')
export class TeamController {

  constructor(private readonly teamService: TeamService) {
  }

  @Post()
  testTeam(@Body() props: AddTeamDto): Promise<void> {
    return this.teamService.addTeam(props.name);
  }
}
