import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/tasks.interface';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) { }

  @Get()
  @UseGuards(AuthGuard)
  async getAllTasks(): Promise<Task[]> {
    return await this.tasksService.getAllTasks();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOneTask(@Param('id', ParseIntPipe) id: number) {
    return await this.tasksService.getOneTask({ id });
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(@Request() req: any, @Body() createTaskDto: CreateTaskDto): Promise<void> {
    const payload = await req['user'];
    const userId = payload.sub;

    await this.tasksService.createTask(userId, createTaskDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.updateTask({
      where: { id },
      data: updateTaskDto,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async removeTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tasksService.removeTask({ id });
  }
}
