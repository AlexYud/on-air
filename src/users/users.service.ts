import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) { }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
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
      const password = await this.hashingService.hashPassword(createUserDto.password);
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: password,
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, tokenPayload: PayloadTokenDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
      }

      if (user.id !== tokenPayload.sub) {
        throw new HttpException('You can only update your own user', HttpStatus.FORBIDDEN);
      }

      const dataUser: { name?: string, password?: string } = {
        name: updateUserDto.name ? updateUserDto.name : (user.name ?? ''),
      }

      if (updateUserDto?.password) {
        dataUser['password'] = await this.hashingService.hashPassword(updateUserDto.password);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: dataUser.name,
          password: dataUser?.password ? dataUser.password : user.password,
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

  async delete(id: number, tokenPayload: PayloadTokenDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
      }

      if (user.id !== tokenPayload.sub) {
        throw new HttpException('You can only delete your own user', HttpStatus.FORBIDDEN);
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

  async uploadAvatarImage(tokenPayload: PayloadTokenDto, file: Express.Multer.File) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
      const fileName = `${tokenPayload.sub}.${fileExtension}`;
      const fileLocale = path.resolve(process.cwd(), 'files', fileName);
      await fs.writeFile(fileLocale, file.buffer);
      const user = await this.prisma.user.findFirst({
        where: { id: tokenPayload.sub },
      });
      if (!user) {
        throw new HttpException(`User with id ${tokenPayload.sub} not found`, HttpStatus.NOT_FOUND);
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: fileName,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      });
      return updatedUser;

    } catch (error) {
      throw new HttpException('Error uploading avatar image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
