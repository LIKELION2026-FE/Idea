import { describe, expect, it } from 'vitest';
import { normalizeMemberList, validateIdeaInput } from './ideas.schema';

describe('idea input validation', () => {
  it('requires a title, track, target user, and problem', () => {
    const result = validateIdeaInput({ title: '아이디어' });

    expect(result).toEqual({ valid: false, message: '타깃 사용자와 문제를 먼저 적어 주세요.' });
  });

  it('trims fields and preserves optional evidence', () => {
    const result = validateIdeaInput({
      title: '  아이디어  ',
      track: 'lion',
      targetUser: '  해외 팀원  ',
      problem: '  회의 내용을 다르게 이해해요.  ',
      currentSolution: '검색해요',
      evidence: '',
    });

    expect(result).toEqual({
      valid: true,
      value: {
        title: '아이디어',
        track: 'lion',
        targetUser: '해외 팀원',
        problem: '회의 내용을 다르게 이해해요.',
        currentSolution: '검색해요',
        evidence: '',
      },
    });
  });
});

describe('team member configuration', () => {
  it('parses configured member pairs and ignores malformed entries', () => {
    expect(normalizeMemberList('a:지민,b:서준,malformed')).toEqual([
      { id: 'a', name: '지민' },
      { id: 'b', name: '서준' },
    ]);
  });
});
