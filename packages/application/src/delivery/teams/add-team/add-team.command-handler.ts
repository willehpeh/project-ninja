import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthContext, EventStore, NewEvent } from '../../../common';
import { AddTeamCommand } from './add-team.command';

@CommandHandler(AddTeamCommand)
export class AddTeamCommandHandler implements ICommandHandler<AddTeamCommand> {

  constructor(private readonly store: EventStore,
              private readonly authContext: AuthContext) {
  }

  async execute(command: AddTeamCommand): Promise<void> {
    const teamsWithName = await this.store.queryByTags([`teamName:${command.props.name}`]);
    if (teamsWithName.length > 0) {
      return Promise.reject('Team with this name already exists');
    }
    const teamAddedEvent: NewEvent = {
      type: 'TeamAdded',
      payload: command.props,
      tags: [
        `team:${ command.props.id }`,
        `teamName:${ command.props.name }`
      ],
      meta: {
        user: this.authContext.userId
      }
    };
    await this.store.append([teamAddedEvent]);
    return Promise.resolve();
  }
}
