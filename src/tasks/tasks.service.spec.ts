import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/database/prisma.service';
import { Task } from './interfaces/tasks.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UsersService } from 'src/users/users.service';

describe('TasksService', () => {
    let service: TasksService;
    const mockPrisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
    const mockUserService: DeepMockProxy<UsersService> = mockDeep<UsersService>();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
                {
                    provide: UsersService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        mockClear(mockPrisma);
        mockClear(mockUserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllTasks', () => {
        it('should return all existing tasks', async () => {
            const tasks: Task[] = [
                {
                    id: 1,
                    title: 'test task 1',
                    description: 'Simple task 1',
                    done: false,
                    authorId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    title: 'test task 2',
                    description: 'Simple task 2',
                    done: true,
                    authorId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ];

            mockPrisma.task.findMany.mockResolvedValue(tasks);

            const result = await service.getAllTasks();
            expect(result).toEqual(tasks);
            expect(mockPrisma.task.findMany).toHaveBeenCalledTimes(1);
        });

        it('should return empty array if task not exist yet', async () => {
            mockPrisma.task.findMany.mockResolvedValue([]);

            const result = await service.getAllTasks();
            expect(result).toEqual([]);
            expect(mockPrisma.task.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('getOneTask', () => {
        it('should return one tasks', () => {
            const userId = 1;
            const task: Task = {
                id: 1,
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockPrisma.task.findUniqueOrThrow.mockResolvedValue(task);

            const result = service.getOneTask({ user: { id: userId }, task: { id: task.id } });

            expect(result).resolves.toEqual(task);
            expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: task.id, authorId: userId },
            });
        });

        it('should throw NotFoundException if no user exists with id given', async () => {
            const prismaError = new PrismaClientKnownRequestError(
                'Task with is id not exist ',
                {
                    code: 'P2025',
                    clientVersion: '3.0.0',
                },
            );

            mockPrisma.task.findUniqueOrThrow.mockRejectedValue(prismaError);

            const result = service.getOneTask({ user: { id: 1 }, task: { id: 1 } });

            await expect(result).rejects.toThrow(NotFoundException);

            expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: 1, authorId: 1 },
            });
        });
    });

    describe('updateTask', () => {
        it('should update a task', async () => {
            const userId = 1;
            const taskUpdated: Task = {
                id: 1,
                title: 'test task 1 updated',
                description: 'Simple task 1',
                done: false,
                authorId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const task: Task = {
                id: 1,
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockPrisma.task.update.mockResolvedValue(taskUpdated);

            const result = service.updateTask({ user: { id: userId }, task: { id: task.id }, data: taskUpdated });

            await expect(result).resolves.toEqual(taskUpdated);
            await expect(result).resolves.not.toEqual(task);
            expect(mockPrisma.task.update).toHaveBeenCalledTimes(1);
            expect(mockPrisma.task.update).toHaveBeenCalledWith({
                where: { id: task.id, authorId: userId },
                data: taskUpdated,
                include: { author: true }
            });
        });

        it('should return NotFoundException when updateTask receive bad id', async () => {
            const userId = 1;
            const taskId = 50;
            const taskUpdated = {
                title: 'test task 1 updated',
                description: 'Simple task 1',
                done: false,
                authorId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const prismaError = new PrismaClientKnownRequestError(
                'Task witht is id not exist ',
                {
                    code: 'P2025',
                    clientVersion: '3.0.0',
                },
            );

            mockPrisma.task.update.mockRejectedValue(prismaError);

            const result = service.updateTask({ user: { id: userId }, task: { id: taskId }, data: taskUpdated });

            await expect(result).rejects.toThrow(NotFoundException);
            expect(mockPrisma.task.update).toHaveBeenCalledTimes(1);
            expect(mockPrisma.task.update).toHaveBeenCalledWith({
                where: { id: taskId, authorId: userId },
                data: taskUpdated,
                include: { author: true }
            });
        });
    });

    describe('removeTask', () => {
        it('should remove a task', async () => {
            const userId = 1;
            const taskId = 1;
            mockPrisma.task.delete.mockResolvedValue(null);

            const result = service.removeTask({ user: { id: userId }, task: { id: taskId } });

            await expect(result).resolves.not.toThrow(NotFoundException);
            expect(mockPrisma.task.delete).toHaveBeenCalledTimes(1);
            expect(mockPrisma.task.delete).toHaveBeenCalledWith({
                where: { authorId: userId, id: taskId },
            });
        });

        it('should return NoFoundException if bad task id given', async () => {
            const userId = 1;
            const taskId = 50;
            const prismaError = new PrismaClientKnownRequestError(
                'Task with is id not exist ',
                {
                    code: 'P2025',
                    clientVersion: '3.0.0',
                },
            );

            mockPrisma.task.delete.mockRejectedValue(prismaError);

            const result = service.removeTask({ user: { id: userId }, task: { id: taskId } });

            await expect(result).rejects.toThrow(NotFoundException);
            expect(mockPrisma.task.delete).toHaveBeenCalledTimes(1);
            expect(mockPrisma.task.delete).toHaveBeenCalledWith({
                where: { id: taskId, authorId: userId },
            });
        });

        describe('createTask', () => {
            it('should create new task', async () => {
                const userId = 1
                const task = {
                    id: 3,
                    title: 'Just a task',
                    description: 'smaill task',
                    done: false,
                    authorId: userId,
                    author: { connect: { id: userId } },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const user = {
                    id: 1,
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@gmail.com",
                    password: "test1234",
                    emailVerifiedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                mockUserService.getUser.mockResolvedValue(user);
                mockPrisma.task.create.mockResolvedValue(null);
                mockPrisma.task.findUniqueOrThrow.mockResolvedValue(task);

                const { id, ...newTask } = task;

                const result = service.createTask({ id: userId }, newTask);

                await expect(result).resolves.not.toThrow();
                expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
                expect(mockPrisma.task.create).toHaveBeenCalledWith({
                    data: newTask,
                });

                const getLastTaskCreated = service.getOneTask({ user: { id: userId }, task: { id } });

                await expect(getLastTaskCreated).resolves.toStrictEqual(task);
                expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
                expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
                    where: { id, authorId: userId },
                });
            });

            it('should return BadRequestException in case duplicate unique fields', async () => {
                const userId = 1;
                const task = {
                    id: 3,
                    title: 'Just a task',
                    description: 'smaill task',
                    done: false,
                    userId,
                    author: { connect: { id: userId } },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const user = {
                    id: 1,
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@gmail.com",
                    password: "test1234",
                    emailVerifiedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                const prismaError = new PrismaClientKnownRequestError(
                    'There is a unique constraint violation, a new user cannot be created with this title',
                    {
                        code: 'P2002',
                        clientVersion: '3.0.0',
                        meta: { target: ['title'] },
                    },
                );

                mockPrisma.task.create.mockRejectedValue(prismaError);
                mockUserService.getUser.mockResolvedValue(user);

                const result = service.createTask({ id: userId }, task);

                await expect(result).rejects.toThrow(BadRequestException);
                expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
                expect(mockPrisma.task.create).toHaveBeenCalledWith({
                    data: {
                        ...task,
                    }
                });
            });
        });
    });
});
