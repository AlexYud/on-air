import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy');
  });

  beforeEach(async () => {
    execSync('cross-env DATABASE_URL=file:./dev-test.db npx prisma migrate deploy');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        TasksModule,
        UsersModule,
        OpenaiModule,
        AuthModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', '..', 'files'),
          serveRoot: '/files',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    prismaService = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users', () => {
    it('POST /users --> create user', async () => {
      const userDto = {
        name: 'Test User',
        email: 'QVcQ2@example.com',
        password: 'password123',
      };
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(201);
      expect(response.body).toEqual({
        id: response.body.id,
        name: userDto.name,
        email: userDto.email,
      });
    });

    it('POST /users --> weak password fails', async () => {
      const userDto = {
        name: 'Test User',
        email: 'QVcQ2@example.com',
        password: 'weak',
      };
      await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(400);
    });

    it('PATCH /users/:id --> update user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'QVcQ2@example.com',
        password: 'password123',
      };
      const updateUserDto = {
        name: 'Updated User',
      };
      const user = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      const auth = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: createUserDto.password,
        })
        .expect(201);
      expect(auth.body).toHaveProperty('accessToken');
      const response = await request(app.getHttpServer())
        .patch(`/users/${user.body.id}`)
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send(updateUserDto)
        .expect(200);
      expect(response.body).toEqual({
        id: user.body.id,
        name: updateUserDto.name,
        email: user.body.email,
      });

    });
  });
});
