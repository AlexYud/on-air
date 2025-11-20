import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service"
import { HashingServiceProtocol } from "../auth/hash/hashing.service";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";

jest.mock('node:fs/promises');

describe('UserService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;
  let hashingService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'QVcQ2@example.com',
              }),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            }
          }
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hashPassword: jest.fn()
          }
        },
      ]
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'QVcQ2@example.com',
        password: 'password123',
      };

      jest.spyOn(hashingService, 'hashPassword').mockResolvedValue('hashedPassword');

      const user = await userService.create(createUserDto);

      expect(hashingService.hashPassword).toHaveBeenCalled();

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: 'hashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });

      expect(user).toEqual({
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
      });
    });

    it('should throw an error when create fails', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'QVcQ2@example.com',
        password: 'password123',
      };
      jest.spyOn(hashingService, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(new Error('Create failed'));
      await expect(userService.create(createUserDto)).rejects.toThrow(
        new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR)
      );
      expect(hashingService.hashPassword).toHaveBeenCalled();
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: 'hashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
    });

    it('should rethrow HttpException when create fails with HttpException', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'QVcQ2@example.com',
        password: 'password123',
      };
      jest.spyOn(hashingService, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(
        new HttpException('Conflict', HttpStatus.CONFLICT)
      );
      await expect(userService.create(createUserDto)).rejects.toThrow(
        new HttpException('Conflict', HttpStatus.CONFLICT)
      );
      expect(hashingService.hashPassword).toHaveBeenCalled();
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: 'hashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
    });
  });

  describe('findOne', () => {
    it('should return a user when findOne is called', async () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

      const user = await userService.findOne(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      });

      expect(user).toEqual(mockUser);
    });

    it('should throw an error when user not found in findOne', async () => {
      const userId = 999;
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(userService.findOne(userId)).rejects.toThrow(
        new HttpException(`User with id ${userId} not found`, HttpStatus.NOT_FOUND)
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when an unexpected error occurs', async () => {
      const userId = 5;

      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('Database failure'));

      await expect(userService.findOne(userId)).rejects.toThrow(
        new HttpException(
          `Error retrieving user with id ${userId}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });

  });

  describe('update', () => {
    it('should throw an error when updating a non-existing user', async () => {
      const userId = 999;
      const updateUserDto = {
        name: 'Updated Name',
        password: 'newpassword123',
      };
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.update(userId, updateUserDto, PayloadTokenDto)).rejects.toThrow(
        new HttpException(`User with id ${userId} not found`, HttpStatus.NOT_FOUND)
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an UNAUTHORIZED error when user is not authorized', async () => {
      const userId = 1;
      const updateUserDto = {
        name: 'Updated Name',
        password: 'newpassword123',
      };
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 2,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
        password: 'hashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(userService.update(userId, updateUserDto, PayloadTokenDto)).rejects.toThrow(
        new HttpException('You can only update your own user', HttpStatus.FORBIDDEN)
      );
    });

    it('should update user successfully', async () => {
      const userId = 1;
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
        password: 'hashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };
      const updatedMockUser = {
        id: 1,
        name: 'Updated Name',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
        password: 'newHashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedMockUser);
      jest.spyOn(hashingService, 'hashPassword').mockResolvedValue('newHashedPassword');

      const updatedUser = await userService.update(userId, updatedMockUser, PayloadTokenDto);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: updatedMockUser.name,
          password: 'newHashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
      expect(updatedUser).toEqual(updatedMockUser);
    });

    it('should throw INTERNAL_SERVER_ERROR when an unexpected error occurs', async () => {
      const userId = 5;
      const updateUserDto = {
        name: 'Updated Name',
        password: 'newpassword123',
      };
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('Database failure'));

      await expect(userService.update(userId, updateUserDto, PayloadTokenDto)).rejects.toThrow(
        new HttpException(
          `Error updating user with id ${userId}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('delete', () => {
    it('should throw an error when deleting a non-existing user', async () => {
      const userId = 999;
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.delete(userId, PayloadTokenDto)).rejects.toThrow(
        new HttpException(`User with id ${userId} not found`, HttpStatus.NOT_FOUND)
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an UNAUTHORIZED error when user is not authorized to delete', async () => {
      const userId = 1;
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 2,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
        password: 'hashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(userService.delete(userId, PayloadTokenDto)).rejects.toThrow(
        new HttpException('You can only delete your own user', HttpStatus.FORBIDDEN)
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should delete user successfully', async () => {
      const userId = 1;
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
        password: 'hashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser);

      const result = await userService.delete(userId, PayloadTokenDto);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw INTERNAL_SERVER_ERROR when an unexpected error occurs', async () => {
      const userId = 5;
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('Database failure'));
      await expect(userService.delete(userId, PayloadTokenDto)).rejects.toThrow(
        new HttpException(
          `Error deleting user with id ${userId}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('avatar upload', () => {
    it('should throw NOT_FOUND error when user not found during avatar upload', async () => {
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      const file = {
        originalname: 'avatar.jpg',
        mimetype: 'image/png',
        buffer: Buffer.from('')
      } as Express.Multer.File;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.uploadAvatarImage(PayloadTokenDto, file)).rejects.toThrow(
        new HttpException('Error uploading avatar image', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should upload avatar image successfully', async () => {
      const userId = 1;
      const PayloadTokenDto = {
        email: 'QVcQ2@example.com',
        iat: 1620000000,
        exp: 1620003600,
        sub: 1,
        aud: 'localhost:3000',
        iss: 'on-air',
      };
      const file = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('filedata')
      } as Express.Multer.File;
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: 'avatar.jpg',
        password: 'hashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };
      const updatedMockUser = {
        id: 1,
        name: 'Test User',
        email: 'QVcQ2@example.com',
        avatar: '1.png',
        password: 'hashedPassword',
        active: true,
        createdAt: '' as unknown as Date,
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedMockUser);
      const result = await userService.uploadAvatarImage(PayloadTokenDto, file);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          avatar: '1.png',
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      });
      expect(result).toEqual(updatedMockUser);
    });
  });
})