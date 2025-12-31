import { DynamicModule, Module } from '@nestjs/common';
import { EventStore } from '@ninja-4-vs/application';
import { JsonlEventStore, JsonlEventStoreOptions } from './jsonl.event-store';

@Module({})
export class EventStoreModule {
  static forRoot(opts: JsonlEventStoreOptions): DynamicModule {
    return {
      module: EventStoreModule,
      global: true,
      providers: [{
        provide: EventStore,
        useFactory: async () => await JsonlEventStore.create(opts)
      }],
      exports: [EventStore]
    };
  }
}
