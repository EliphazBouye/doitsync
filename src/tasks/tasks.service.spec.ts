import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/database/prisma.service';
import { Task } from './interfaces/tasks.interface';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  const prismaMock = {
    task: {
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService,
		   {
         provide: PrismaService,
         useValue: prismaMock,
       }
		 ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaMock.task.findMany.mockClear();
    prismaMock.task.findUniqueOrThrow.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks', () => {
    it("should return all existing tasks", async () => {
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
        }
      ];

      prismaMock.task.findMany.mockResolvedValue(tasks);

      const result = await service.getAllTasks();
      expect(result).toEqual(tasks);
      expect(prismaMock.task.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if task not exist yet", async () => {
      prismaMock.task.findMany.mockResolvedValue([]);

      const result = await service.getAllTasks();
      expect(result).toEqual([]);
      expect(prismaMock.task.findMany).toHaveBeenCalledTimes(1);
    })

  })

  describe("getOneTask", () => {
    it("should return one tasks", () => {
      const task: Task = {
          id: 1,
          title: "test task 1",
          description: "Simple task 1",
          done: false,
        }

      prismaMock.task.findUniqueOrThrow.mockResolvedValue(task)

      const result = service.getOneTask({id: task.id})

      expect(result).resolves.toEqual(task);
      expect(prismaMock.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prismaMock.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: task.id },
      });
    });

    it("should throw NotFoundException if no user exists with id given", async () => {
      prismaMock.task.findUniqueOrThrow.mockRejectedValue(new NotFoundException());

      const result = service.getOneTask({ id: 1 });

      await expect(result).rejects.toThrow(NotFoundException);

      expect(prismaMock.task.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prismaMock.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    })
  })
});
