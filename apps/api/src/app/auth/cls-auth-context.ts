import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AuthContext } from '@ninja-4-vs/application';

export const CLS_USER_ID = 'userId';

@Injectable()
export class ClsAuthContext extends AuthContext {
  constructor(private readonly cls: ClsService) {
    super();
  }

  userId(): string {
    return this.cls.get(CLS_USER_ID) ?? 'anonymous';
  }
}
