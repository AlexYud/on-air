import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BodyCreateTaskInterceptor } from 'src/common/interceptors/body-create-task.interceptor';

@Controller('tasks')
export class TasksController {

  constructor(private readonly tasksService: TasksService) { }

  @Get()
  findAllTasks(@Query() paginationDto: PaginationDto) {
    return this.tasksService.findAll(paginationDto);
  }

  @Get(":id")
  findOneTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @UseInterceptors(BodyCreateTaskInterceptor)
  createTask(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Patch(":id")
  updateTask(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskDto) {
    return this.tasksService.update(id, body);
  }

  @Delete(":id")
  deleteTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.delete(id);
  }
}
