import { CommandBus } from '@nestjs/cqrs';
import { AddTeamCommand } from '@ninja-4-vs/application';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TeamService {
  constructor(private readonly commandBus: CommandBus) {
  }

  async addTeam(): Promise<void> {
    const command = new AddTeamCommand({
      name: 'test',
      id: 'test-id',
      description: 'Team description',
    });
    await this.commandBus.execute(command)
  }
}
