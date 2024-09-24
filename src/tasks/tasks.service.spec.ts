import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/database/prisma.service';
import { Task } from './interfaces/tasks.interface';

describe('TasksService', () => {
  let service: TasksService;
  const prismaMock = {
    task: {
      findOne: jest.fn(),
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
    prismaMock.task.findOne.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
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

      const result = await service.findAll();
      expect(result).toEqual(tasks);
      expect(prismaMock.task.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if task not exist yet", async () => {
      prismaMock.task.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(prismaMock.task.findMany).toHaveBeenCalledTimes(1);
    })

  })
});
