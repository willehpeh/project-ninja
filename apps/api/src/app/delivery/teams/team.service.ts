import { CommandBus } from '@nestjs/cqrs';
import { AddTeamCommand, ConcurrencyError } from '@ninja-4-vs/application';
import { ConflictException, Injectable } from '@nestjs/common';

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
    try {
      await this.commandBus.execute(command);
    } catch (e) {
      if (e instanceof ConcurrencyError) {
        throw new ConflictException(e.message);
      }
    }
  }
}
