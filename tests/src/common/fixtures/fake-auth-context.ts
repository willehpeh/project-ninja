import { AuthContext } from '@ninja-4-vs/application';

export class FakeAuthContext extends AuthContext {
  constructor(private readonly _userId = 'test-user') {
    super();
  }

  userId(): string {
    return this._userId;
  }
}
