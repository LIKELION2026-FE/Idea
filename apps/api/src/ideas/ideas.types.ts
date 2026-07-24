export type Track = 'sjf' | 'aac' | 'lion' | 'open' | 'unassigned';

export interface Member {
  id: string;
  name: string;
}

export interface IdeaInput {
  title: string;
  track: Track | string;
  targetUser: string;
  problem: string;
  currentSolution: string;
  evidence: string;
}

export interface IdeaRecord extends IdeaInput {
  id: string;
  memberId: string;
  memberName: string;
  createdAt: string;
  analysisStatus: 'pending' | 'complete' | 'failed';
  analysisMessage?: string;
  analysis: IdeaAnalysis | null;
}

export interface IdeaAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string[];
  questions: string[];
  refinedProblem: string;
}
