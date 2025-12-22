import { AddTeamCommand, AddTeamCommandHandler } from '@ninja-4-vs/application';
import { InMemoryEventStore } from '../../common/fixtures/in-memory.event.store';

describe('Add Team', () => {
  let command: AddTeamCommand;
  let handler: AddTeamCommandHandler;
  let fakeEventStore: InMemoryEventStore;

  beforeEach(async () => {
    fakeEventStore = new InMemoryEventStore();
    const authContext = { userId: 'user1', permissions: [] };
    handler = new AddTeamCommandHandler(fakeEventStore, authContext);

    command = new AddTeamCommand({
      id: '1',
      name: 'Team 1',
      description: 'Team 1 description'
    });
    await handler.execute(command);
  });

  it('should add the new team', () => {
    const teamAddedEvent = fakeEventStore.events[0];
    expect(teamAddedEvent.type).toBe('TeamAdded');
    expect(teamAddedEvent.payload).toEqual(command.props);
  });

  it('should refuse to add a second team with the same name', async () => {
    const otherCommand = new AddTeamCommand({
      id: '2',
      name: 'Team 1',
      description: 'Team 2 description'
    });

    await expect(handler.execute(otherCommand)).rejects.toBeTruthy();
  });

});
