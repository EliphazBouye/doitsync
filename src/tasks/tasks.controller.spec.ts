import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/tasks.interface';
import { NotFoundException } from '@nestjs/common';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';

describe('TasksController', () => {
  let controller: TasksController;
  const mockTasksService: DeepMockProxy<TasksService> =
    mockDeep<TasksService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    mockClear(mockTasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTasks', () => {
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

    it('should return list of tasks', async () => {
      mockTasksService.getAllTasks.mockResolvedValue(tasks);

      const result = await controller.getAllTasks();

      expect(result).toEqual(tasks);
      expect(mockTasksService.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOneTask', () => {
    it('should return exception from get bad id', async () => {
      const id = 40;

      mockTasksService.getOneTask.mockRejectedValue(new NotFoundException());

      const result = controller.getOneTask(id);

      await expect(result).rejects.toThrow(NotFoundException);
      expect(mockTasksService.getOneTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.getOneTask).toHaveBeenCalledWith({ id });
    });

    it('should get one task by his id', async () => {
      const id = 1;
      const task: Task = {
        id: 1,
        title: 'test task 1',
        description: 'Simple task 1',
        done: false,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTasksService.getOneTask.mockResolvedValue(task);

      const result = controller.getOneTask(id);

      await expect(result).resolves.toEqual(task);
      expect(mockTasksService.getOneTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.getOneTask).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateTasks', () => {
    it('should update a task', async () => {
      const id = 1;
      const task: Task = {
        id: 1,
        title: 'test task 1',
        description: 'Simple task 1',
        done: false,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const taskUpdated = {
        id: 1,
        title: 'test title updated',
        description: task.description,
        done: task.done,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTasksService.updateTask.mockResolvedValue(taskUpdated);
      mockTasksService.getOneTask.mockResolvedValue(taskUpdated);

      const result = controller.updateTask(id, taskUpdated);

      await expect(result).resolves.toEqual(taskUpdated);
      await expect(result).resolves.not.toEqual(task);
      expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith({
        where: { id: id },
        data: {
          ...taskUpdated
        },
      });
    });

    it('should return NotFoundException if update get bad task id', async () => {
      const id = 50;
      const taskUpdated: Task = {
        id: 1,
        title: 'test task 1',
        description: 'Simple task 1',
        done: false,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTasksService.updateTask.mockRejectedValue(new NotFoundException());

      const result = controller.updateTask(id, taskUpdated);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('should return new task created', async () => {
      const authorId = 1
      const task = {
        title: 'test task 1',
        description: 'Simple task 1',
        done: false,
        authorId,
        author: { connect: { id: 1 } },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockTasksService.createTask.mockResolvedValue();

      await expect(controller.createTask(authorId, task)).resolves.not.toThrow();
      expect(mockTasksService.createTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.createTask).toHaveBeenCalledWith({
        ...task
      });
    });
  });

  describe('removeTask', () => {
    it('should remove a task', async () => {
      const id = 1;
      mockTasksService.removeTask.mockResolvedValue();

      await expect(controller.removeTask(id)).resolves.not.toThrow();
      expect(mockTasksService.removeTask).toHaveBeenCalledTimes(1);
      expect(mockTasksService.removeTask).toHaveBeenCalledWith({ id });
    });
  });
});
