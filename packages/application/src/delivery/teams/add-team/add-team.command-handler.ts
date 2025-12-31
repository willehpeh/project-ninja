import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppendCondition, AuthContext, EventStore, NewEvent } from '../../../common';
import { AddTeamCommand } from './add-team.command';

@CommandHandler(AddTeamCommand)
export class AddTeamCommandHandler implements ICommandHandler<AddTeamCommand> {

  constructor(private readonly store: EventStore,
              private readonly authContext: AuthContext) {
  }

  async execute(command: AddTeamCommand): Promise<void> {
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
    const condition = new AppendCondition([`teamName:${ command.props.name }`], 0);
    await this.store.append([teamAddedEvent], condition);
    return Promise.resolve();
  }
}
