import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
	imports: [UsersModule],
  controllers: [TasksController],
  providers: [TasksService, UsersService],
  exports: [TasksService],
})
export class TasksModule {}
