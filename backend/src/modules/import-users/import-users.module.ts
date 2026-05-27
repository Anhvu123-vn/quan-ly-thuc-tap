import { Module } from '@nestjs/common';
import { ImportUsersController } from './import-users.controller';
import { ImportUsersService } from './import-users.service';
import { UsersModule } from '../users/users.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [UsersModule, LogsModule],
  controllers: [ImportUsersController],
  providers: [ImportUsersService],
  exports: [ImportUsersService],
})
export class ImportUsersModule {}
