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
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
    ) { }

    async getAllTasks(): Promise<Task[]> {
        return await this.prisma.task.findMany();
    }

    async getOneTask(params: {
        user: Prisma.UserWhereUniqueInput,
        task: Prisma.TaskWhereUniqueInput,
    }): Promise<Task> {
        const { user, task } = params;
        try {
            return await this.prisma.task.findUniqueOrThrow({
                where: {
                    id: task.id,
                    authorId: user.id,
                },
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

    async createTask(user: Prisma.UserWhereUniqueInput, createTaskDto: Prisma.TaskCreateInput) {
        try {
            const author = await this.usersService.getUser({
                id: user.id,
            });

            if (!author) {
                throw new NotFoundException('User not found!');
            }

            await this.prisma.task.create({
                data: {
                    ...createTaskDto,
                    author: {
                        connect: {
                            id: author.id,
                        },
                    },
                },
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
        user: Prisma.UserWhereUniqueInput,
        task: Prisma.TaskWhereUniqueInput;
        data: Prisma.TaskUpdateInput;
    }): Promise<Task> {
        try {
            const { user, task, data } = params;
            return await this.prisma.task.update({
                where: {
                    id: task.id,
                    authorId: user.id,
                },
                data,
                include: {
                    author: true,
                },
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

    async removeTask(params: {
        user: Prisma.UserWhereUniqueInput,
        task: Prisma.TaskWhereUniqueInput
    }) {
        const { user, task } = params;
        try {
            await this.prisma.task.delete({
                where: {
                    id: task.id,
                    authorId: user.id,
                },
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
