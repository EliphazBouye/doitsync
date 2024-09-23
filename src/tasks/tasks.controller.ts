import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/tasks.interface';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(): Promise<Task[]> {
    return await this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return await this.tasksService.findOne({ id });
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto); 
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
    return await this.tasksService.update({ where: { id }, data: updateTaskDto});
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.tasksService.delete({ id });
  }
}
