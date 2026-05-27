import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { LogsModule } from '../logs/logs.module';
import { BatchesModule } from '../batches/batches.module';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
  imports: [LogsModule, BatchesModule],
})
export class ApplicationsModule {}
