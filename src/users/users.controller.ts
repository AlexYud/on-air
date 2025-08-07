import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {

  @Get(':id')
  findOneUser() {
    return { id: 1, name: 'John Doe' };
  }
}
