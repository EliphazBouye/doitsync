import { Injectable } from '@nestjs/common';
import { Task } from './interfaces/tasks.interface';

@Injectable()
export class TasksService {
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

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    return this.tasks[id];
  }

  create(data: Task) {
    return this.tasks.push(data); 
  }

  update(id: number, updateData: Task): Task {
    this.tasks.splice(id, 1, updateData);
    return this.tasks[id];
  }

  delete(id: number) {
    return this.tasks.splice(id, 1)
  }
}
