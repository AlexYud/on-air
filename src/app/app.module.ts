import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { UsersModule } from 'src/users/users.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TasksModule, UsersModule, OpenaiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
