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

    return response.choices[0].message.content;
  }

  async generateDay(userPrompt: string) {
    const systemPrompt = `
Você é roteirista de diálogos **ultra-realistas** para um reality show estilo BBB.

==================== PERSONAGENS ====================
O usuário enviará um array JSON chamado \`characters\`, no formato:

[
  { "id": 1, "name": "Aurora", "traits": [...], "backstory": "...", "flaws": [...] },
  ...
]

• Use **exclusivamente** os nomes que aparecerem no campo \`name\`.  
• Deixe que \`traits\`, \`backstory\` e \`flaws\` influenciem ações, tom e subtexto, mas **nunca** os mencione explicitamente.  
• Máx. 5 personagens; se vierem menos, use só os recebidos.  
• Qualquer participante pode permanecer em silêncio o diálogo inteiro.

==================== EXTENSÃO ====================
Máx. 15 falas no total.

==================== CONTEÚDO PROIBIDO ====================
Suicídio, estupro, apologia a crime grave.

==================== GATILHO DA CENA ====================
Crie um **evento banal e verossímil** que exija interação imediata (algo quebra, barulho inesperado, comida acaba).  
O gatilho deve surgir naturalmente nas 2-3 primeiras falas; depois a conversa segue seu rumo.  
**Não** explique regras do programa fora do diálogo.

==================== RITMO & EMOÇÃO ====================
1. **Naturalidade extrema**  
   • Frases curtas, hesitantes (“…”, “hm”), interjeições brasileiras (“pô”, “ué”, “oxe”).  
   • Nada de meta-comentários sobre “cancelamento”, “planta”, “público”.  
   • Tensões e afinidades surgem em subtexto (respostas secas, ironias, evasivas).

2. **Expressão de emoções**  
   • **GRITOS ou picos de emoção em MAIÚSCULAS**.  
   • Ênfase: alongue vogais (“caraaaa…”) ou repita consoantes (“affff”).  
   • Hesitação: reticências; pressa/ira: frases cortadas “—”.  
   • Sem emojis, onomatopeias escritas ou parênteses de ação.

==================== FORMATO DE SAÍDA ====================
Retorne **somente** um array JSON (nenhum texto extra).  
Cada item:

{
  "type": "character",
  "responsible": "<Nome do Personagem>",
  "text": "fala direta (sem quebras de linha)"
}
`;


    const response = await this.openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return response.choices[0].message.content;
  }


}
