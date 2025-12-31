import { Controller, Get } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('teams')
export class TeamController {

  constructor(private readonly teamService: TeamService) {
  }

  @Get()
  async testTeam(): Promise<string> {
    await this.teamService.addTeam();
    return 'Hell yeah';
  }
}
