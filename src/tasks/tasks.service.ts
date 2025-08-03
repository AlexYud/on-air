import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Description for Task 1',
      completed: false,
    },
    {
      id: 2,
      name: 'Task 2',
      description: 'Description for Task 2',
      completed: true,
    }
  ];

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    const task = this.tasks.find(task => task.id === id);
    if (task) return task;
    throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
  }

  create(createTaskDto: CreateTaskDto) {
    const newTask: Task = {
      id: this.tasks.length + 1,
      ...createTaskDto,
      completed: false,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    const updatedTask = { ...this.tasks[taskIndex], ...updateTaskDto };
    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  delete(id: number) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new HttpException(`Task with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    this.tasks.splice(taskIndex, 1);
    return { message: `Task with id ${id} deleted successfully` };
  }
}
