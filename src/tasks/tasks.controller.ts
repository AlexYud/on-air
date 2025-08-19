import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';

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

  @UseGuards(AuthTokenGuard)
  @Post()
  createTask(
    @Body() body: CreateTaskDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto
  ) {
    return this.tasksService.create(body, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(":id")
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto
  ) {
    return this.tasksService.update(id, body, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(":id")
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto
  ) {
    return this.tasksService.delete(id, tokenPayload);
  }
}
