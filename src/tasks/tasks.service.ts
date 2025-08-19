import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(paginationDto?: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto || {};
      const tasks = await this.prisma.task.findMany({
        take: limit,
        skip: offset,
      });
      return tasks;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error fetching tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const task = await this.prisma.task.findFirst({
        where: { id },
      });

      if (!task) {
        throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
      }

      return task;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error fetching task with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createTaskDto: CreateTaskDto, tokenPayload: PayloadTokenDto) {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          name: createTaskDto.name,
          description: createTaskDto.description,
          completed: false,
          userId: tokenPayload.sub,
        },
      });
      return newTask;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error creating task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, tokenPayload: PayloadTokenDto) {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: { id },
      });
      if (!findTask) {
        throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      if (findTask.userId !== tokenPayload.sub) {
        throw new HttpException('You can only update your own tasks', HttpStatus.FORBIDDEN);
      }
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          name: updateTaskDto?.name ? updateTaskDto.name : findTask.name,
          description: updateTaskDto?.description ? updateTaskDto.description : findTask.description,
          completed: updateTaskDto?.completed ? updateTaskDto.completed : findTask.completed,
        },
      });
      return updatedTask;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error updating task with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number, tokenPayload: PayloadTokenDto) {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: { id },
      });
      if (!findTask) {
        throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      if (findTask.userId !== tokenPayload.sub) {
        throw new HttpException('You can only delete your own tasks', HttpStatus.FORBIDDEN);
      }
      const deletedTask = await this.prisma.task.delete({
        where: { id },
      });
      return deletedTask;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error deleting task with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
