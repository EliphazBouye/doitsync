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

      const result = service.getOneTask({ id: task.id });

      expect(result).resolves.toEqual(task);
      expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: task.id },
        include: { author: true }
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

      const result = service.getOneTask({ id: 1 });

      await expect(result).rejects.toThrow(NotFoundException);

      expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { author: true }
      });
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const id = 1;
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

      const result = service.updateTask({ where: { id }, data: taskUpdated });

      await expect(result).resolves.toEqual(taskUpdated);
      await expect(result).resolves.not.toEqual(task);
      expect(mockPrisma.task.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id },
        data: taskUpdated,
        include: { author: true }
      });
    });

    it('should return NotFoundException when updateTask receive bad id', async () => {
      const id = 50;
      const taskUpdated: Task = {
        id: 1,
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

      const result = service.updateTask({ where: { id }, data: taskUpdated });

      await expect(result).rejects.toThrow(NotFoundException);
      expect(mockPrisma.task.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id },
        data: taskUpdated,
        include: { author: true }
      });
    });
  });

  describe('removeTask', () => {
    it('should remove a task', async () => {
      const id = 1;
      mockPrisma.task.delete.mockResolvedValue(null);

      const result = service.removeTask({ id });

      await expect(result).resolves.not.toThrow(NotFoundException);
      expect(mockPrisma.task.delete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should return NoFoundException if bad task id given', async () => {
      const id = 50;
      const prismaError = new PrismaClientKnownRequestError(
        'Task with is id not exist ',
        {
          code: 'P2025',
          clientVersion: '3.0.0',
        },
      );

      mockPrisma.task.delete.mockRejectedValue(prismaError);

      const result = service.removeTask({ id });

      await expect(result).rejects.toThrow(NotFoundException);
      expect(mockPrisma.task.delete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    describe('createTask', () => {
      it('should create new task', async () => {
        const task = {
          id: 3,
          title: 'Just a task',
          description: 'smaill task',
          done: false,
          authorId: 1,
          author: { connect: { id: 1 } },
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

        const result = service.createTask(newTask);

        await expect(result).resolves.not.toThrow();
        expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.task.create).toHaveBeenCalledWith({
          data: newTask,
          include: { author: true }
        });

        const getLastTaskCreated = service.getOneTask({ id });

        await expect(getLastTaskCreated).resolves.toStrictEqual(task);
        expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
        expect(mockPrisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
          where: { id },
        });
      });

      it('should return BadRequestException in case duplicate unique fields', async () => {
        const task = {
          id: 3,
          title: 'Just a task',
          description: 'smaill task',
          done: false,
          authorId: 1,
          author: { connect: { id: 1 } },
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

        const result = service.createTask(task);

        await expect(result).rejects.toThrow(BadRequestException);
        expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.task.create).toHaveBeenCalledWith({
          data: {
            task,
            author: {
              connect: {
                id: task.author.connect.id
              }
            }
            ,
          }
        });
      });
    });
  });
});
