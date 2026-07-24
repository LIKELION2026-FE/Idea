import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { IdeaAnalysis, IdeaRecord } from '../ideas/ideas.types';

@Injectable()
export class OpenAIAnalysisService {
  private readonly client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  isConfigured(): boolean {
    return Boolean(this.client);
  }

  async analyze(idea: IdeaRecord): Promise<IdeaAnalysis> {
    if (!this.client) throw new Error('OPENAI_API_KEY_MISSING');

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            '당신은 해커톤 아이디어의 문제정의를 검토하는 제품 전략가예요.',
            '아이디어를 칭찬하는 데 그치지 말고, 사용자·상황·손실·기존 대안·차별화 근거를 구체적으로 분석하세요.',
            '입력은 정리되지 않은 브레인스토밍 메모일 수 있습니다. 비어 있거나 임시로 표시된 정보는 메모의 맥락에서 추론하되, 추론임을 밝히고 검증 질문으로 연결하세요.',
            '확인되지 않은 사실은 사실처럼 쓰지 말고, 검증이 필요한 가정으로 표시하세요.',
            '반드시 다음 JSON 키만 사용하세요: summary, strengths, weaknesses, differentiation, questions, refinedProblem.',
            'summary와 refinedProblem은 문자열, 나머지는 문자열 배열이어야 합니다.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: idea.title,
            track: idea.track,
            targetUser: idea.targetUser,
            problem: idea.problem,
            currentSolution: idea.currentSolution,
            evidence: idea.evidence,
          }),
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error('OPENAI_EMPTY_RESPONSE');
    return this.parse(content);
  }

  private parse(content: string): IdeaAnalysis {
    const parsed = JSON.parse(content) as Partial<IdeaAnalysis>;
    if (
      typeof parsed.summary !== 'string' ||
      typeof parsed.refinedProblem !== 'string' ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      !Array.isArray(parsed.differentiation) ||
      !Array.isArray(parsed.questions)
    ) {
      throw new Error('OPENAI_INVALID_RESPONSE');
    }

    return {
      summary: parsed.summary,
      strengths: parsed.strengths.map(String),
      weaknesses: parsed.weaknesses.map(String),
      differentiation: parsed.differentiation.map(String),
      questions: parsed.questions.map(String),
      refinedProblem: parsed.refinedProblem,
    };
  }
}
