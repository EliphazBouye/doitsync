import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './interfaces/tasks.interface';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTasks(): Promise<Task[]> {
    return await this.prisma.task.findMany();
  }

  async getOneTask(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task> {
    try {
      return await this.prisma.task.findUniqueOrThrow({
        where: taskWhereUniqueInput,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(error.message);
        }
      }
      throw error;
    }
  }

  async createTask(data: Prisma.TaskCreateInput) {
    try {
      await this.prisma.task.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          if (error.meta.target instanceof Array) {
            error.meta.target.forEach((t) => {
              throw new BadRequestException(
                `There is a unique constraint violation, a new user cannot be created with this ${t}`,
              );
            });
          }
        }
      }
      throw error;
    }
  }

  async updateTask(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    try {
      const { where, data } = params;
      return await this.prisma.task.update({
        where,
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(error.meta?.cause);
        }
      }
      throw error;
    }
  }

  async removeTask(where: Prisma.TaskWhereUniqueInput) {
    try {
      await this.prisma.task.delete({
        where,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(error.meta?.cause);
        }
      }
      throw error;
    }
  }
}
