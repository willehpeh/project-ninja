import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventStoreModule } from '@ninja-4-vs/infrastructure';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule.forRoot(),
    EventStoreModule.forRoot({
      basePath: './data'
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
