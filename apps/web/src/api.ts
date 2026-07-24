import type { Idea, IdeaForm, Member, Track } from './types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
  return payload as T;
}

export function getMembers(): Promise<Member[]> {
  return request<Member[]>('/members');
}

export function getIdeas(track: Track | 'all' = 'all'): Promise<Idea[]> {
  return request<Idea[]>(`/ideas?track=${track}`);
}

export function createIdea(memberId: string, idea: IdeaForm): Promise<Idea> {
  const note = idea.note.trim();
  const firstLine = note.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '아이디어 메모';
  const title = firstLine.length > 44 ? `${firstLine.slice(0, 44).trim()}…` : firstLine;

  return request<Idea>('/ideas', {
    method: 'POST',
    body: JSON.stringify({
      memberId,
      idea: {
        title,
        track: idea.track || 'unassigned',
        targetUser: '아직 정하지 않았어요',
        problem: note,
        currentSolution: '',
        evidence: '',
      },
    }),
  });
}

export function analyzeIdea(id: string): Promise<Idea> {
  return request<Idea>(`/ideas/${id}/analyze`, { method: 'POST' });
}
