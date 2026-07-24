export type Track = 'sjf' | 'aac' | 'lion' | 'open';

export interface Member {
  id: string;
  name: string;
}

export interface IdeaAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string[];
  questions: string[];
  refinedProblem: string;
}

export interface Idea {
  id: string;
  memberId: string;
  memberName: string;
  track: Track;
  title: string;
  targetUser: string;
  problem: string;
  currentSolution: string;
  evidence: string;
  createdAt: string;
  analysisStatus: 'pending' | 'complete' | 'failed';
  analysisMessage?: string;
  analysis: IdeaAnalysis | null;
}

export interface IdeaForm {
  title: string;
  track: Track;
  targetUser: string;
  problem: string;
  currentSolution: string;
  evidence: string;
}
