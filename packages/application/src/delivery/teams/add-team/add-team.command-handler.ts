import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppendCondition, EventStore, NewEvent } from '../../../common';
import { AddTeamCommand } from './add-team.command';

@CommandHandler(AddTeamCommand)
export class AddTeamCommandHandler implements ICommandHandler<AddTeamCommand> {

  constructor(private readonly store: EventStore) {
  }

  async execute(command: AddTeamCommand): Promise<void> {
    const teamAddedEvent: NewEvent = {
      type: 'TeamAdded',
      payload: command.props,
      tags: [
        `team:${ command.props.id }`,
        `teamName:${ command.props.name }`
      ],
    };
    const condition = new AppendCondition([`teamName:${ command.props.name }`], 0);
    await this.store.append([teamAddedEvent], condition);
    return Promise.resolve();
  }
}
