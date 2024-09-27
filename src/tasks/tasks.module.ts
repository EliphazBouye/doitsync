import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [TasksController],
  providers: [TasksService, UsersService, AuthService, JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }],
  exports: [TasksService],
})
export class TasksModule { }
