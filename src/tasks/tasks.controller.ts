import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/tasks.interface';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Get()
    @UseGuards(AuthGuard)
    async getAllTasks(): Promise<Task[]> {
        return await this.tasksService.getAllTasks();
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getOneTask(
        @Request() req: any,
        @Param('id', ParseIntPipe) taskId: number,
    ): Promise<Task> {
        const payload = await req['user'];
        const userId = payload.sub;

        return await this.tasksService.getOneTask(userId, { id: taskId });
    }

    @Post()
    @UseGuards(AuthGuard)
    async createTask(
        @Request() req: any,
        @Body() createTaskDto: CreateTaskDto,
    ): Promise<void> {
        const payload = await req['user'];
        const userId = payload.sub;

        await this.tasksService.createTask(userId, createTaskDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async updateTask(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto,
    ): Promise<Task> {
        const payload = req['user'];
        const userId = payload.sub;
        return await this.tasksService.updateTask({
            user: userId,
            task: { id },
            data: updateTaskDto,
        });
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async removeTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.tasksService.removeTask({ id });
    }
}
