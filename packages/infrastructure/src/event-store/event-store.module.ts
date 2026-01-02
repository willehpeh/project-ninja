import { DynamicModule, Module } from '@nestjs/common';
import { AuthContext, EventStore } from '@ninja-4-vs/application';
import { JsonlEventStore, JsonlEventStoreOptions } from './jsonl.event-store';

@Module({})
export class EventStoreModule {
  static forRoot(opts: JsonlEventStoreOptions): DynamicModule {
    return {
      module: EventStoreModule,
      global: true,
      providers: [{
        provide: EventStore,
        inject: [AuthContext],
        useFactory: async (authContext: AuthContext) => await JsonlEventStore.create(opts, authContext)
      }],
      exports: [EventStore]
    };
  }
}
