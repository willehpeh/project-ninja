import { Module } from '@nestjs/common';
import { EventStoreModule } from '@ninja-4-vs/infrastructure';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule.forRoot(),
    EventStoreModule.forRoot({
      basePath: './data'
    })
  ]
})
export class AppModule {
}
