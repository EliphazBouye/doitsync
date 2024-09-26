import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  /* Get a user by unique input it can be id or email */
  async getUser(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: userWhereUniqueInput });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(error.message);
        }
      }
      throw error;
    }
  }

  /* Create new user or throw Exception if user already exist */
  async createUser(createUserData: Prisma.UserCreateInput) {
    try {
      await this.prisma.user.create({ data: createUserData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const fields = error.meta?.target instanceof Array && error.meta?.target?.join(', ');
          throw new BadRequestException(`An user already exist with this ${fields}`);
        }
      }
      throw error
    }
  }
}
