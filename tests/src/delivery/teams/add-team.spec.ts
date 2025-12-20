import { AddTeamCommand, AddTeamCommandHandler } from '@ninja-4-vs/application';
import { FakeEventStore } from '../../common/fixtures/fake.event-store';

describe('Add Team', () => {
  let command: AddTeamCommand;
  let handler: AddTeamCommandHandler;
  let fakeEventStore: FakeEventStore;

  beforeEach(() => {
    fakeEventStore = new FakeEventStore();
    const authContext = { userId: 'user1', permissions: [] };
    handler = new AddTeamCommandHandler(fakeEventStore, authContext);
  });

  it('should add a new team', async () => {
    command = new AddTeamCommand({
      id: '1',
      name: 'Team 1',
      description: 'Team 1 description'
    });
    await handler.execute(command);

    const expectedEvent = {
      payload: {
        type: 'TeamAdded',
        id: '1',
        name: 'Team 1',
        description: 'Team 1 description'
      }, metadata: { userId: 'user1' }
    };

    expect(fakeEventStore.events).toEqual([expectedEvent]);
  });

});
