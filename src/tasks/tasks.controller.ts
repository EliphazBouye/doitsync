import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/tasks.interface';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) { }

  @Get()
  async getAllTasks(): Promise<Task[]> {
    return await this.tasksService.getAllTasks();
  }

  @Get(':id')
  async getOneTask(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return await this.tasksService.getOneTask({ id });
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto): Promise<void> {
    await this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
    return await this.tasksService.update({ where: { id }, data: updateTaskDto });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tasksService.delete({ id });
  }
}
