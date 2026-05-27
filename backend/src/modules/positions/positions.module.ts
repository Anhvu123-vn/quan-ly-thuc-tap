import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { LogsModule } from '../logs/logs.module';
import { BatchesModule } from '../batches/batches.module';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
  imports: [LogsModule, BatchesModule],
})
export class PositionsModule {}
