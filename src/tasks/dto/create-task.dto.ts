import { Prisma } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  done: boolean;

  author: Prisma.UserCreateNestedOneWithoutTasksInput;
}
