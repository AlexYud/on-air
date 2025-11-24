import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app/app.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { UsersModule } from 'src/users/users.module';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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
    await app.init();
  });

  it('/ (GET)', () => { });
});
