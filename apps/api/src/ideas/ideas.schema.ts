import { IdeaInput, Member } from './ideas.types';

const TRACKS = new Set(['sjf', 'aac', 'lion', 'open']);

export function validateIdeaInput(input: unknown):
  | { valid: true; value: IdeaInput }
  | { valid: false; message: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: '아이디어 내용을 확인해 주세요.' };
  }

  const raw = input as Record<string, unknown>;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const track = typeof raw.track === 'string' ? raw.track.trim() : '';
  const targetUser = typeof raw.targetUser === 'string' ? raw.targetUser.trim() : '';
  const problem = typeof raw.problem === 'string' ? raw.problem.trim() : '';
  const currentSolution = typeof raw.currentSolution === 'string' ? raw.currentSolution.trim() : '';
  const evidence = typeof raw.evidence === 'string' ? raw.evidence.trim() : '';

  if (!title) {
    return { valid: false, message: '아이디어 제목을 먼저 적어 주세요.' };
  }

  if (!targetUser || !problem) {
    return { valid: false, message: '타깃 사용자와 문제를 먼저 적어 주세요.' };
  }

  if (!TRACKS.has(track)) {
    return { valid: false, message: '트랙을 하나 선택해 주세요.' };
  }

  return {
    valid: true,
    value: { title, track, targetUser, problem, currentSolution, evidence },
  };
}

export function normalizeMemberList(value?: string): Member[] {
  if (!value) {
    return [
      { id: 'member-1', name: '팀원 1' },
      { id: 'member-2', name: '팀원 2' },
      { id: 'member-3', name: '팀원 3' },
      { id: 'member-4', name: '팀원 4' },
    ];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .map((entry) => {
      const separator = entry.indexOf(':');
      if (separator <= 0 || separator === entry.length - 1) return null;
      const id = entry.slice(0, separator).trim();
      const name = entry.slice(separator + 1).trim();
      return id && name ? { id, name } : null;
    })
    .filter((member): member is Member => Boolean(member));
}
