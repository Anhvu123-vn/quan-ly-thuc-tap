import { Module } from '@nestjs/common';
import { CompanyBatchService } from './company-batch.service';
import { CompanyBatchController } from './company-batch.controller';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [LogsModule],
  controllers: [CompanyBatchController],
  providers: [CompanyBatchService],
  exports: [CompanyBatchService],
})
export class CompanyBatchModule {}
