import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { normalizeMemberList, validateIdeaInput } from './ideas.schema';
import { IdeaInput, IdeaRecord, Member } from './ideas.types';
import { IdeasRepository } from './ideas.repository';
import { OpenAIAnalysisService } from '../analysis/openai-analysis.service';

export const IDEAS_REPOSITORY = 'IDEAS_REPOSITORY';
export const MEMBER_LIST = 'MEMBER_LIST';

@Injectable()
export class IdeasService {
  constructor(
    @Inject(IDEAS_REPOSITORY) private readonly repository: IdeasRepository,
    @Inject(MEMBER_LIST) private readonly members: Member[],
    private readonly analysisService: OpenAIAnalysisService,
  ) {}

  list(track?: string): Promise<IdeaRecord[]> {
    return this.repository.list(track);
  }

  getMembers(): Member[] {
    return this.members;
  }

  async create(memberId: string, rawInput: unknown): Promise<IdeaRecord> {
    const member = this.members.find((candidate) => candidate.id === memberId);
    if (!member) throw new BadRequestException('팀원을 먼저 선택해 주세요.');

    const validated = validateIdeaInput(rawInput);
    if (!validated.valid) throw new BadRequestException(validated.message);

    const record = await this.repository.create(member.id, member.name, validated.value);
    return this.tryAnalyze(record);
  }

  async analyze(id: string): Promise<IdeaRecord> {
    const idea = await this.repository.findById(id);
    if (!idea) throw new NotFoundException('아이디어를 찾을 수 없어요.');
    return this.tryAnalyze(idea);
  }

  private async tryAnalyze(idea: IdeaRecord): Promise<IdeaRecord> {
    if (!this.analysisService.isConfigured()) {
      return this.repository.updateAnalysis(idea.id, 'pending', null, 'OpenAI 키를 추가하면 분석할 수 있어요.');
    }

    try {
      const analysis = await this.analysisService.analyze(idea);
      return this.repository.updateAnalysis(idea.id, 'complete', analysis);
    } catch (error) {
      const message = error instanceof Error ? error.message : '분석 중 문제가 생겼어요.';
      return this.repository.updateAnalysis(idea.id, 'failed', null, message);
    }
  }
}
