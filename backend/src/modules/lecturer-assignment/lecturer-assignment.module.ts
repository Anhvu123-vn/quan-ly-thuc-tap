import { Module } from '@nestjs/common';
import { LecturerAssignmentService } from './lecturer-assignment.service';
import { LecturerAssignmentController } from './lecturer-assignment.controller';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [LogsModule],
  controllers: [LecturerAssignmentController],
  providers: [LecturerAssignmentService],
  exports: [LecturerAssignmentService],
})
export class LecturerAssignmentModule {}
