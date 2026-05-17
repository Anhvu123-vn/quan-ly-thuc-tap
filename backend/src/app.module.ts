import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PositionsModule } from './modules/positions/positions.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { LogsModule } from './modules/logs/logs.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    PrismaModule,
    PublicModule,
    AuthModule,
    UsersModule,
    PositionsModule,
    ApplicationsModule,
    ApprovalsModule,
    LogsModule,
    EvaluationsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
