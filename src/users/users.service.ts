import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
      if (!user) {
        throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error retrieving user with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: createUserDto.password,
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
      return user;
    } catch (error) {
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: updateUserDto.name ? updateUserDto.name : user.name,
          password: updateUserDto.password ? updateUserDto.password : user.password,
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error updating user with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error deleting user with id ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
