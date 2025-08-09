import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
      throw new HttpException(`Error fetching task with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createTaskDto: CreateTaskDto) {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          name: createTaskDto.name,
          description: createTaskDto.description,
          completed: false,
        },
      });
      return newTask;
    } catch (error) {
      throw new HttpException('Error creating task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: { id },
      });
      if (!findTask) {
        throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
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
      throw new HttpException(`Error updating task with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number) {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: { id },
      });
      if (!findTask) {
        throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      const deletedTask = await this.prisma.task.delete({
        where: { id },
      });
      return deletedTask;
    } catch (error) {
      throw new HttpException(`Error deleting task with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
