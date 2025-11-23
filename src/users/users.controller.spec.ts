import { CreateUserDto } from "./dto/create-user-dto";
import { UpdateUserDto } from "./dto/update-user-dto";
import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let controller: UsersController;

  const usersServiceMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    uploadAvatarImage: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(usersServiceMock as any);
  });

  it('should find one user', async () => {
    const id = 1;
    await controller.findOneUser(id);
    expect(usersServiceMock.findOne).toHaveBeenCalledWith(id);
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'QVcQ2@example.com',
      password: 'password123',
    };
    const createdUser = {
      id: 1,
      email: 'QVcQ2@example.com',
      name: 'Test User',
    };
    (usersServiceMock.create).mockResolvedValue(createdUser);
    const user = await controller.createUser(createUserDto);
    expect(user).toEqual(createdUser);
    expect(usersServiceMock.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should update a user', async () => {
    const id = 1;
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'QVcQ2@example.com',
      password: 'newpassword123',
    };
    const tokenPayload = {
      email: 'QVcQ2@example.com',
      iat: 1620000000,
      exp: 1620003600,
      sub: 1,
      aud: 'localhost:3000',
      iss: 'on-air',
    };
    const updatedUser = {
      id: 1,
      email: 'QVcQ2@example.com',
      name: 'Updated Name',
    };
    (usersServiceMock.update).mockResolvedValue(updatedUser);
    const user = await controller.updateUser(id, updateUserDto, tokenPayload);
    expect(user).toEqual(updatedUser);
    expect(usersServiceMock.update).toHaveBeenCalledWith(id, updateUserDto, tokenPayload);
  });

  it('should delete a user', async () => {
    const id = 1;
    const tokenPayload = {
      email: 'QVcQ2@example.com',
      iat: 1620000000,
      exp: 1620003600,
      sub: 1,
      aud: 'localhost:3000',
      iss: 'on-air',
    };
    (usersServiceMock.delete).mockResolvedValue({ message: 'User deleted successfully' });
    const result = await controller.deleteUser(id, tokenPayload);
    expect(result).toEqual({ message: 'User deleted successfully' });
    expect(usersServiceMock.delete).toHaveBeenCalledWith(id, tokenPayload);
  });

  it('should upload avatar image', async () => {
    const tokenPayload = {
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
    };
    (usersServiceMock.uploadAvatarImage).mockResolvedValue(mockUser);
    const result = await controller.uploadAvatar(tokenPayload, file);
    expect(result).toEqual(mockUser);
    expect(usersServiceMock.uploadAvatarImage).toHaveBeenCalledWith(tokenPayload, file);
  });
});