import { Injectable } from '@nestjs/common';
import { Task } from './interfaces/tasks.interface';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Task[]> {
    return await this.prisma.task.findMany();
  }

  async findOne(taskWhereUniqueInput: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return await this.prisma.task.findUnique({ where: taskWhereUniqueInput });
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return await this.prisma.task.create({ data }); 
  }

  async update(params: {
    where: Prisma.TaskWhereUniqueInput,
    data: Prisma.TaskUpdateInput
  }): Promise<Task> {
    const { where, data } = params;
    return await this.prisma.task.update({
      where,
      data,
    });
  }

  delete(where: Prisma.TaskWhereUniqueInput) {
    return this.prisma.task.delete({
      where
    });
  }
}
