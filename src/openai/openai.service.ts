import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async ask(question: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [{ role: 'user', content: question }],
    });

    return response.choices[0].message;
  }
}
