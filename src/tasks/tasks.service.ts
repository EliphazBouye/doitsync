import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './interfaces/tasks.interface';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService,
							private readonly usersService: UsersService) {}

  async getAllTasks(): Promise<Task[]> {
    return await this.prisma.task.findMany();
  }

  async getOneTask(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task> {
    try {
      return await this.prisma.task.findUniqueOrThrow({
        where: taskWhereUniqueInput,
				include: {
					author: true
				}
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

  async createTask(createTaskDto: Prisma.TaskCreateInput) {
    try {
			const author = await this.usersService.getUser({
				id: createTaskDto.author.connect.id
			})

			if (!author) {
				throw new NotFoundException('User not found!');
			}

      await this.prisma.task.create({ data:
				{
					...createTaskDto,
					author: { 
						connect: {
							id: createTaskDto.author.connect.id
						}
					},
				}
			});

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const fields =
            (error.meta.target instanceof Array &&
              error.meta?.target?.join(', ')) ||
            'unknown fields';

          throw new BadRequestException(
            `There is a unique constraint violation, a new user cannot be created with this ${fields}`,
          );
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
				include: {
					author: true
				}
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
