import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TeamAdded } from '@ninja-4-vs/domain';
import { AuthContext, EventStore } from '../../../common';
import { AddTeamCommand } from './add-team.command';

@CommandHandler(AddTeamCommand)
export class AddTeamCommandHandler implements ICommandHandler<AddTeamCommand> {

  constructor(private readonly store: EventStore,
              private readonly authContext: AuthContext) {
  }

  async execute(command: AddTeamCommand): Promise<void> {
    const event: TeamAdded = {
      type: 'TeamAdded',
      ...command.props
    };
    await this.store.append(event, this.authContext.userId);
    return Promise.resolve();
  }
}
