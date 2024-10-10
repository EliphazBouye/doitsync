import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthService } from 'src/auth/auth.service';
import { Task } from './interfaces/tasks.interface';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';
import { AuthGuard } from 'src/auth/guards/auth.guard';

describe('TasksController', () => {
    let controller: TasksController;
    const mockTasksService: DeepMockProxy<TasksService> =
        mockDeep<TasksService>();
    const mockAuthService: DeepMockProxy<AuthService> = mockDeep<AuthService>();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: mockTasksService,
                },
                {
                    provide: AuthService,
                    useValue: mockTasksService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({
                canActivate: (ctx: ExecutionContext) => {
                    const req = ctx.switchToHttp().getRequest();
                    req.user = { sub: 1, email: 'test@test.com' };
                    return true;
                },
            })
            .compile();

        controller = module.get<TasksController>(TasksController);
        mockClear(mockTasksService);
        mockClear(mockAuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllTasks', () => {
        const req = { user: { sub: 1, email: 'test@test.com' } };
        const tasks: Task[] = [
            {
                id: 1,
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: req.user.sub,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                title: 'test task 2',
                description: 'Simple task 2',
                done: true,
                authorId: req.user.sub,
                createdAt: new Date(),
                updatedAt: new Date(),
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
            const req = { user: { sub: 1, email: 'test@test.com' } };
            const taskId = 40;

            mockTasksService.getOneTask.mockRejectedValue(new NotFoundException());

            const result = controller.getOneTask(req, taskId);

            await expect(result).rejects.toThrow(NotFoundException);
            expect(mockTasksService.getOneTask).toHaveBeenCalledTimes(1);
        });

        it('should get one task by his id', async () => {
            const req = { user: { sub: 1, email: 'test@test.com' } };
            const task: Task = {
                id: 1,
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: req.user.sub,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockTasksService.getOneTask.mockResolvedValue(task);

            const result = controller.getOneTask(req, task.id);

            await expect(result).resolves.toEqual(task);
            expect(mockTasksService.getOneTask).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateTasks', () => {
        it('should update a task', async () => {
            const req = { user: { sub: 1, email: 'test@test.com' } };
            const id = 1;
            const task: Task = {
                id: 1,
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: req.user.sub,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const taskUpdated = {
                id: 1,
                title: 'test title updated',
                description: task.description,
                done: task.done,
                authorId: req.user.sub,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockTasksService.updateTask.mockResolvedValue(taskUpdated);

            const result = controller.updateTask(req, id, taskUpdated);

            await expect(result).resolves.toEqual(taskUpdated);
            await expect(result).resolves.not.toEqual(task);
            expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
        });

        it('should return NotFoundException if update get bad task id', async () => {
            const taskId = 50;
            const req = { user: { sub: 1, email: 'test@test.com' } };
            const taskUpdated: Task = {
                id: 1,
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: req.user.sub,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockTasksService.updateTask.mockRejectedValue(new NotFoundException());

            const result = controller.updateTask(req, taskId, taskUpdated);

            await expect(result).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('should return new task created', async () => {
            const req = { user: { userId: 1, email: 'test@test.com' } };
            const task = {
                title: 'test task 1',
                description: 'Simple task 1',
                done: false,
                authorId: req.user.userId,
                author: { connect: { id: 1 } },
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockTasksService.createTask.mockResolvedValue();

            await expect(controller.createTask(req, task)).resolves.not.toThrow();
            expect(mockTasksService.createTask).toHaveBeenCalledTimes(1);
        });
    });

    describe('removeTask', () => {
        it('should remove a task', async () => {
            const taskId = 1;
            mockTasksService.removeTask.mockResolvedValue();

            await expect(controller.removeTask(taskId)).resolves.not.toThrow();
            expect(mockTasksService.removeTask).toHaveBeenCalledTimes(1);
        });
    });
});
