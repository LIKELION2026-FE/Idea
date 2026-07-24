import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { analyzeIdea, createIdea, getIdeas, getMembers } from './api';
import type { Idea, IdeaForm, Member, Track } from './types';

const TRACKS: Array<{ id: Track | 'all'; label: string; short: string }> = [
  { id: 'all', label: '전체 아이디어', short: '전체' },
  { id: 'sjf', label: '럭셔리 경험', short: 'SJF' },
  { id: 'aac', label: '웰니스', short: 'AAC' },
  { id: 'lion', label: '국경을 넘는 협업', short: '협업' },
  { id: 'open', label: '검증된 문제', short: 'Open' },
];

const EMPTY_FORM: IdeaForm = {
  title: '',
  track: 'lion',
  targetUser: '',
  problem: '',
  currentSolution: '',
  evidence: '',
};

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | 'all'>('all');
  const [form, setForm] = useState<IdeaForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyIdeaId, setBusyIdeaId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const visibleIdeas = useMemo(
    () => selectedTrack === 'all' ? ideas : ideas.filter((idea) => idea.track === selectedTrack),
    [ideas, selectedTrack],
  );

  useEffect(() => {
    Promise.all([getMembers(), getIdeas()])
      .then(([loadedMembers, loadedIdeas]) => {
        setMembers(loadedMembers);
        setIdeas(loadedIdeas);
        setSelectedMember(loadedMembers[0]?.id || '');
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof IdeaForm>(field: K, value: IdeaForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMember) return setMessage('작성할 팀원을 먼저 선택해 주세요.');
    if (!form.title.trim() || !form.targetUser.trim() || !form.problem.trim()) {
      return setMessage('아이디어 제목, 타깃 사용자, 문제를 먼저 적어 주세요.');
    }

    setSubmitting(true);
    setMessage('아이디어를 저장하고 있어요.');
    try {
      const created = await createIdea(selectedMember, form);
      setIdeas((current) => [created, ...current]);
      setForm(EMPTY_FORM);
      setMessage(created.analysisStatus === 'complete' ? '아이디어와 AI 분석 결과를 등록했어요.' : '아이디어를 등록했어요. OpenAI 키를 추가하면 분석할 수 있어요.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '아이디어를 저장하지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAnalyze(id: string) {
    setBusyIdeaId(id);
    setMessage('아이디어를 다시 분석하고 있어요.');
    try {
      const updated = await analyzeIdea(id);
      setIdeas((current) => current.map((idea) => idea.id === id ? updated : idea));
      setMessage(updated.analysisStatus === 'complete' ? 'AI 분석을 업데이트했어요.' : updated.analysisMessage || '아직 분석을 완료하지 못했어요.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '분석을 요청하지 못했어요.');
    } finally {
      setBusyIdeaId(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="container nav-inner">
          <a className="wordmark" href="#top">Brain<span>Storm</span></a>
          <nav className="track-tabs" aria-label="아이디어 트랙">
            {TRACKS.map((track) => (
              <button key={track.id} className={`track-tab ${selectedTrack === track.id ? 'active' : ''}`} onClick={() => setSelectedTrack(track.id)} type="button">{track.short}</button>
            ))}
          </nav>
          <a className="nav-link" href="#submit">아이디어 적기</a>
        </div>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">TEAM IDEA BOARD</p>
            <h1>아이디어를 꺼내고,<br /><span>같이 더 선명하게 만들어요.</span></h1>
            <p>완성된 기획이 아니어도 괜찮아요. 떠오른 문제를 적으면 팀원과 AI가 다음 질문을 찾아드려요.</p>
          </div>
          <div className="hero-side">
            <div className="hero-rule" />
            <strong>{ideas.length}개의 아이디어가 모였어요.</strong>
            <span>문제정의가 선명해질수록 좋은 아이디어에 가까워져요.</span>
          </div>
        </section>

        <section className="container workspace-grid">
          <aside className="submit-panel" id="submit">
            <div className="panel-heading">
              <div><p className="eyebrow">NEW IDEA</p><h2>아이디어 적기</h2></div>
              <span className="step-badge">01</span>
            </div>
            <p className="panel-intro">지금 떠오르는 만큼만 적어도 돼요. 문제를 먼저 적으면 AI가 빈틈을 찾아드려요.</p>

            <form onSubmit={handleSubmit}>
              <label>누가 적고 있나요?
                <select value={selectedMember} onChange={(event) => setSelectedMember(event.target.value)}>
                  <option value="">팀원을 선택해 주세요</option>
                  {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </label>
              <label>아이디어 제목
                <input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="예: 회의 합의 보정 AI" />
              </label>
              <label>어느 트랙과 가까운가요?
                <select value={form.track} onChange={(event) => updateField('track', event.target.value as Track)}>
                  {TRACKS.filter((track) => track.id !== 'all').map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}
                </select>
              </label>
              <label>누가 이 문제를 겪나요?
                <input value={form.targetUser} onChange={(event) => updateField('targetUser', event.target.value)} placeholder="예: 한국·베트남 대학생 프로젝트 팀" />
              </label>
              <label>어떤 문제가 생기나요?
                <textarea value={form.problem} onChange={(event) => updateField('problem', event.target.value)} placeholder="사용자가 어떤 상황에서 무엇을 잃는지 적어 주세요." rows={4} />
              </label>
              <label>지금은 어떻게 해결하나요? <span className="optional">선택</span>
                <textarea value={form.currentSolution} onChange={(event) => updateField('currentSolution', event.target.value)} placeholder="검색, 수작업, 주변 사람에게 묻기 등" rows={3} />
              </label>
              <label>인터뷰나 관찰 근거가 있나요? <span className="optional">선택</span>
                <textarea value={form.evidence} onChange={(event) => updateField('evidence', event.target.value)} placeholder="누구에게 들었는지, 얼마나 자주 겪는지 적어 주세요." rows={3} />
              </label>
              <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '저장하는 중이에요' : '아이디어 등록하기'}</button>
            </form>
            <p className="privacy-note">작성한 아이디어는 팀 보드에 공개돼요.</p>
          </aside>

          <section className="board-panel" aria-labelledby="board-title">
            <div className="board-heading">
              <div><p className="eyebrow">TEAM BOARD</p><h2 id="board-title">함께 보는 아이디어</h2></div>
              <span className="board-count">{visibleIdeas.length}개</span>
            </div>
            {message && <div className="status-message" role="status">{message}</div>}
            {loading ? <div className="empty-state">아이디어를 불러오는 중이에요.</div> : visibleIdeas.length === 0 ? <div className="empty-state"><strong>아직 아이디어가 없어요.</strong><span>왼쪽에서 첫 번째 문제를 적어 주세요.</span></div> : (
              <div className="idea-list">
                {visibleIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} busy={busyIdeaId === idea.id} onAnalyze={handleAnalyze} />)}
              </div>
            )}
          </section>
        </section>
      </main>

      <footer className="footer"><div className="container"><strong>BrainStorm</strong><span>문제부터 같이 찾아볼게요.</span></div></footer>
    </div>
  );
}

function IdeaCard({ idea, busy, onAnalyze }: { idea: Idea; busy: boolean; onAnalyze: (id: string) => void }) {
  const track = TRACKS.find((candidate) => candidate.id === idea.track);
  return (
    <article className={`idea-card track-${idea.track}`}>
      <div className="idea-card-head"><div><span className="track-pill">{track?.label || idea.track}</span><h3>{idea.title}</h3></div><span className="author">{idea.memberName} · {new Date(idea.createdAt).toLocaleDateString('ko-KR')}</span></div>
      <div className="idea-facts"><div><span>타깃 사용자</span><strong>{idea.targetUser}</strong></div><div><span>문제</span><p>{idea.problem}</p></div></div>
      {idea.currentSolution && <div className="supporting-fact"><span>현재 방식</span><p>{idea.currentSolution}</p></div>}
      <AnalysisBlock idea={idea} busy={busy} onAnalyze={onAnalyze} />
    </article>
  );
}

function AnalysisBlock({ idea, busy, onAnalyze }: { idea: Idea; busy: boolean; onAnalyze: (id: string) => void }) {
  if (idea.analysisStatus !== 'complete' || !idea.analysis) {
    return <div className={`analysis-pending ${idea.analysisStatus}`}><div><strong>{idea.analysisStatus === 'failed' ? '분석을 다시 시도해 주세요.' : 'AI 분석을 기다리고 있어요.'}</strong><span>{idea.analysisMessage || 'OpenAI 키를 추가하면 문제의 강점과 빈틈을 확인할 수 있어요.'}</span></div><button type="button" onClick={() => onAnalyze(idea.id)} disabled={busy}>{busy ? '분석 중이에요' : '다시 분석하기'}</button></div>;
  }

  const analysis = idea.analysis;
  return <div className="analysis"><div className="analysis-heading"><div><p className="eyebrow">AI REVIEW</p><h4>{analysis.summary}</h4></div><span>분석 완료</span></div><div className="analysis-grid"><AnalysisList title="좋은 점" items={analysis.strengths} tone="good" /><AnalysisList title="확인할 점" items={analysis.weaknesses} tone="warn" /><AnalysisList title="차별화 방향" items={analysis.differentiation} tone="accent" /><AnalysisList title="팀이 답할 질문" items={analysis.questions} tone="neutral" /></div><div className="refined-problem"><span>다듬은 문제정의</span><p>{analysis.refinedProblem}</p></div></div>;
}

function AnalysisList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return <div className={`analysis-list ${tone}`}><h5>{title}</h5><ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>;
}

export default App;
