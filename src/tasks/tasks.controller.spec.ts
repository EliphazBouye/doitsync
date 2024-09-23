import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/database/prisma.service';
import { Task } from './interfaces/tasks.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;
  let prisma: PrismaService;
  const tasks: Task[] = [
    {
      id: 1,
      title: "test task 1",
      description: "Simple task 1",
      done: false,
    },
    {
      id: 2,
      title: "test task 2",
      description: "Simple task 2",
      done: true,
    }];

  const taskUpdated: Task = {
    id: 1,
    title: "test title updated",
    description: "Simple task 1",
    done: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService, PrismaService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    controller = module.get<TasksController>(TasksController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return list of tasks', async () => {
    jest.spyOn(service, 'findAll').mockImplementation(async () => tasks);

    expect(await controller.findAll()).toBe(tasks);
  });

  it('should return exception from get bad id', async () => {
    await expect(controller.findOne(50)).rejects.toThrow(NotFoundException);
  });

  it('should return on task, get from his id', async () => {
    jest.spyOn(service, 'findOne').mockImplementation(async () => tasks[0]);

    expect(await controller.findOne(0)).toBe(tasks[0]);
    expect(await service.findOne({ id: 0 })).toBe(tasks[0]);
  });

  it('update a task', async () => {
    jest.spyOn(controller, 'update').mockImplementation(async () => taskUpdated);
    jest.spyOn(controller, 'findOne').mockImplementation(async () => taskUpdated);

    expect(await controller.update(1, {
      title: 'test title updated',
      description: tasks[0].description,
      done: tasks[0].done
    }))
      .toBe(taskUpdated);

    expect(await controller.findOne(1)).toBe(taskUpdated);
  })

  it('return exception in update in case of bad task id', async () => {
    await expect(controller.update(50, taskUpdated)).rejects.toThrow(BadRequestException);
  });

  it('should return new task created', async () => {
    controller.create = jest.fn().mockResolvedValue(null);

    await expect(controller.create({
      title: "test task 1",
      description: "Simple task 1",
      done: false,
    })).resolves.not.toThrow();
  });

  it('delete a task', async () => {
    controller.remove = jest.fn().mockResolvedValue(null);

    await expect(controller.remove(1)).resolves.not.toThrow();
  });

});
