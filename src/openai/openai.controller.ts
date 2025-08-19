import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openAiService: OpenaiService) { }

  @Get('ask')
  async ask(@Query('q') question: string) {
    if (!question) {
      return { error: 'Query param ?q= is required' };
    }
    return await this.openAiService.ask(question);
  }

  @Get('day')
  @UseInterceptors(LoggerInterceptor)
  async generateDay(@Query('p') prompt: string) {
    return await this.openAiService.generateDay(prompt);
  }
}
