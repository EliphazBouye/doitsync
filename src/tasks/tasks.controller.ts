import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  private tasks: Task[] = [
    {
      title: "Simple task 0", 
      description: "This is a simple a task 0", 
      done: false, 
    },
    {
      title: "Make API", 
      description: "Should create a simple api", 
      done: false, 
    },
  ]

  constructor() {}

  @Get()
  findAll(): Task[] {
    return this.tasks;
  }

  @Get(':id')
  findOne(@Param('id') id: number): Task {
    return this.tasks[id];
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasks.push(createTaskDto); 
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasks.splice(id, 1, updateTaskDto)
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tasks.splice(id, 1)
  }
}
