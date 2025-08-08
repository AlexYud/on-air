import { Controller, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';

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
}
