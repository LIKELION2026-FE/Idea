import { useState } from 'react';

type ProblemTrack = 'sjf' | 'aac' | 'lion' | 'open';
type Filter = ProblemTrack | 'all';

const TRACKS: Array<{ id: ProblemTrack; short: string; label: string; title: string; description: string; guide: string }> = [
  { id: 'sjf', short: 'SJF', label: '럭셔리 경험', title: '럭셔리 경험에서 끊기는 순간', description: '구매 전부터 구매 후까지, 고객과 브랜드의 연결이 약해지는 지점을 찾아요.', guide: 'https://likelion.notion.site/14th-hackathon-guide?p=3a344860a4f48021a0ace64177a7424d&pm=c' },
  { id: 'aac', short: 'AAC', label: '웰니스', title: '웰니스 지식과 행동 사이의 간극', description: '좋은 루틴을 알고도 계속 지키기 어려운 상황을 찾아요.', guide: 'https://likelion.notion.site/14th-hackathon-guide?p=3a344860a4f480d6b046c78269a84430&pm=c' },
  { id: 'lion', short: '협업', label: '국경을 넘는 협업', title: '국경을 넘는 협업에서 생기는 숨은 오해', description: '번역이 끝난 뒤에도 남아 있는 이해의 차이를 찾아요.', guide: 'https://likelion.notion.site/14th-hackathon-guide?p=3a344860a4f480b3b60edb40fc90706a&pm=c' },
  { id: 'open', short: 'Open', label: '검증된 문제', title: '검증된 사용자의 반복되는 문제', description: '자유주제인 만큼, 실제 사용자의 목소리에서 출발해야 해요.', guide: 'https://likelion.notion.site/14th-hackathon-guide?p=3a344860a4f480d49c0bd278c2d53eb1&pm=c' },
];

const COMPARISON = [
  { track: 'sjf' as const, requirement: 'AI와 럭셔리 경험을 연결해요. AI 기반 제품, 인터랙티브 리테일, 360° 고객 경험 중 하나를 선택해요.', proof: '파트너사의 제품·매장·브랜드 헤리티지가 문제 해결의 핵심 근거인가요?', caution: '3D 쇼룸이나 가상 체험만 남으면 장식처럼 보여요. 고객의 구체적인 불편이 필요해요.' },
  { track: 'aac' as const, requirement: '피부·건강·일상 루틴을 더 나은 방향으로 바꾸는 웰니스 서비스를 제안해요.', proof: '사용자의 행동과 일상이 어떻게 달라지나요? 기존 웰니스 서비스와 무엇이 다른가요?', caution: '“개인 맞춤형 AI 건강관리”처럼 흔해질 수 있어요. 의료 진단으로 오해받지 않게 범위를 정해야 해요.' },
  { track: 'lion' as const, requirement: 'AI로 지리·언어·문화·조직의 협업 장벽을 해결해요.', proof: '어떤 장벽을 얼마나 해결했나요? 실제 협업에서 AI가 핵심 역할을 했나요?', caution: '번역기·회의록·메타버스와 비슷해질 수 있어요. 실제 협업 실패가 보여야 해요.' },
  { track: 'open' as const, requirement: '구체적인 타깃 사용자의 실제 문제를 AI로 해결해요.', proof: '누가 어디서 쓰나요? 인터뷰나 시장조사로 문제와 지불 의사를 확인했나요?', caution: '자유로운 만큼 “AI를 붙인 일반 서비스”가 되기 쉬워요. 고객 검증이 필요해요.' },
];

const PROBLEMS: Record<ProblemTrack, Array<{ title: string; description: string }>> = {
  sjf: [
    { title: '온라인에서 제품을 믿고 고르기 어려워요', description: '고가 제품을 보려는 고객은 소재·구조·디테일을 충분히 이해하지 못해 구매를 확신하기 어려워요.' },
    { title: '구매 후 제품을 어떻게 관리할지 몰라요', description: '럭셔리 제품을 구매한 고객은 관리 방법과 시점을 알기 어려워 제품을 제대로 관리하지 못하고 브랜드와도 멀어져요.' },
    { title: '매장에 갈 때마다 취향을 다시 설명해요', description: '고객의 취향과 이전 상담 맥락이 이어지지 않아 매번 처음부터 설명해야 하고, 개인화된 경험도 끊겨요.' },
  ],
  aac: [
    { title: '좋은 루틴을 알아도 계속 지키기 어려워요', description: '사용자는 필요한 루틴을 알고 있어도 그날의 컨디션과 일정에 맞게 조정하지 못해 중단하게 돼요.' },
    { title: '내 상태를 한 번에 이해하기 어려워요', description: '수면·스트레스·활동량·피부 상태가 여러 곳에 흩어져 있어 지금 무엇이 필요한지 판단하기 어려워요.' },
    { title: '추천받은 루틴을 실제 생활에 적용하기 어려워요', description: '기존 웰니스 추천은 사용자의 시간과 생활 제약보다 이상적인 상태를 기준으로 해서 실행하기 어려워요.' },
  ],
  lion: [
    { title: '같은 회의를 해도 결정사항이 달라져요', description: '서로 다른 언어를 쓰는 팀원은 번역된 문장을 이해해도 마감일·담당자·결정사항을 다르게 해석할 수 있어요.' },
    { title: '돌려 말한 피드백의 진짜 뜻을 놓쳐요', description: '국가마다 피드백과 동의 표현이 달라 상대방의 의도를 오해하거나 필요한 이견을 꺼내지 못할 수 있어요.' },
    { title: '회의가 끝나면 업무 맥락이 흩어져요', description: '서로 다른 시간대와 조직의 팀은 결정사항과 업무 맥락이 문서와 채팅에 나뉘어 실행이 늦어질 수 있어요.' },
  ],
  open: [
    { title: '반복되는 불편을 매번 수작업으로 버텨요', description: '특정 지역의 사용자는 같은 문제를 검색하거나 지인에게 묻는 방식으로 계속 해결하고 있어요.' },
    { title: '기존 서비스를 써도 내 상황에 맞지 않아요', description: '사용자의 조건과 맥락이 충분히 반영되지 않아 원하는 결과를 얻기 어렵고, 다시 찾아보게 돼요.' },
    { title: '불편하지만 얼마나 손해인지 몰라요', description: '문제를 겪는 사람은 분명하지만 시간·비용·기회 손실이 얼마나 되는지 아직 확인되지 않았어요.' },
  ],
};

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'sjf', label: '럭셔리 경험' },
  { id: 'aac', label: '웰니스' },
  { id: 'lion', label: '국경을 넘는 협업' },
  { id: 'open', label: '검증된 문제' },
];

export function ProblemDefinitionsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const visibleCount = activeFilter === 'all' ? 12 : PROBLEMS[activeFilter].length;

  function selectFilter(filter: Filter) {
    setActiveFilter(filter);
    if (filter !== 'all') document.querySelector('#problems')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="problem-home">
      <nav className="problem-nav" aria-label="문서 메뉴">
        <div className="problem-container problem-nav-inner">
          <a className="problem-wordmark" href="/" aria-label="문서 처음으로 이동">문제<span>부터</span></a>
          <div className="problem-product-tabs" aria-label="트랙 바로가기">
            <button className={`problem-product-tab ${activeFilter === 'all' ? 'active' : ''}`} type="button" onClick={() => selectFilter('all')}>전체 트랙</button>
            {TRACKS.map((track) => <button key={track.id} className={`problem-product-tab ${activeFilter === track.id ? 'active' : ''}`} type="button" onClick={() => selectFilter(track.id)}>{track.short}</button>)}
          </div>
          <div className="problem-nav-actions">
            <a className="problem-nav-link" href="#questions">회의 질문</a>
            <a className="problem-nav-cta" href="/ideas">아이디어 적으러 가기</a>
          </div>
        </div>
      </nav>

      <main id="home">
        <section className="problem-hero problem-container">
          <div className="problem-hero-grid">
            <div>
              <p className="problem-eyebrow">LIKELION UNIV. 14TH HACKATHON</p>
              <h1>아이디어보다 먼저,<br />문제부터 찾아볼게요.</h1>
              <p className="problem-hero-copy">네 트랙의 요구사항을 비교하고, 다른 팀의 아이디어와 겹치지 않을 문제를 좁혀가는 팀 회의용 문서예요.</p>
              <div className="problem-metric-row" aria-label="문서 요약">
                <div className="problem-metric"><strong>4</strong><span>트랙</span></div>
                <div className="problem-metric"><strong>12</strong><span>문제정의 후보</span></div>
                <div className="problem-metric"><strong>5</strong><span>검증 질문</span></div>
              </div>
              <a className="problem-primary-action" href="/ideas">아이디어 적으러 가기 <span aria-hidden="true">→</span></a>
            </div>
            <aside className="problem-hero-note">
              <strong>이번 단계에서 정할 것</strong>
              <p>기능이나 기술을 먼저 고르지 않아요. 누가 어떤 상황에서 무엇을 잃고 있는지 확인한 뒤, 해결책을 정해요.</p>
            </aside>
          </div>
        </section>

        <section className="problem-container" aria-label="트랙 선택">
          <div className="problem-filter-row">
            {FILTERS.map((filter) => <button key={filter.id} className={`problem-filter-button ${activeFilter === filter.id ? 'active' : ''}`} type="button" onClick={() => selectFilter(filter.id)}>{filter.label}</button>)}
          </div>
        </section>

        <section className="problem-section problem-container" id="principles">
          <div className="problem-section-head"><div><h2>좋은 문제정의의 기준</h2><p>AI를 사용했다는 설명보다, 사용자의 손실과 기존 방식의 한계를 먼저 보여줘요.</p></div><span className="problem-section-count">팀이 함께 확인해요</span></div>
          <div className="problem-principles">
            <div><strong>구체적인 사용자</strong><span>누가, 어떤 상황에서 겪는 문제인지 보여요.</span></div>
            <div><strong>반복되는 손실</strong><span>한 번의 불편이 아니라 계속 발생하는 손실이에요.</span></div>
            <div><strong>현재의 대안</strong><span>사용자가 지금 어떻게 버티고 있는지 알아요.</span></div>
            <div><strong>차별화의 근거</strong><span>기존 서비스가 놓친 이유를 설명할 수 있어요.</span></div>
          </div>
        </section>

        <section className="problem-section problem-container" id="tracks">
          <div className="problem-section-head"><div><h2>트랙을 한눈에 비교해요</h2><p>각 트랙이 요구하는 증거와 아이디어가 약해지는 지점을 함께 봐요.</p></div><span className="problem-section-count">트랙 적합성부터 확인해요</span></div>
          <div className="problem-comparison"><table><thead><tr><th>트랙</th><th>핵심 요구사항</th><th>반드시 증명할 것</th><th>주의할 점</th></tr></thead><tbody>{COMPARISON.map((row) => <tr key={row.track}><td><span className="problem-track-label"><i className={`problem-track-dot ${row.track}`} />{TRACKS.find((track) => track.id === row.track)?.short}</span></td><td>{row.requirement}</td><td>{row.proof}</td><td>{row.caution}</td></tr>)}</tbody></table></div>
        </section>

        <section className="problem-section problem-container" id="problems">
          <div className="problem-section-head"><div><h2>문제정의 후보를 둘러봐요</h2><p>아직 해결책이나 기능은 정하지 않았어요. 해결할 가치가 있는 상황만 적었어요.</p></div><span className="problem-section-count">{visibleCount}개 후보</span></div>
          <div className="problem-track-grid">
            {TRACKS.filter((track) => activeFilter === 'all' || track.id === activeFilter).map((track) => <article className="problem-track-section" key={track.id}>
              <div className="problem-track-heading"><span className={`problem-track-mark ${track.id}`}>{track.short}</span><div><h3>{track.title}</h3><p>{track.description}</p></div><a className="problem-track-link" href={track.guide} target="_blank" rel="noreferrer">트랙 가이드 ↗</a></div>
              <div className="problem-card-grid">{PROBLEMS[track.id].map((problem, index) => <article className="problem-card" key={problem.title}><span className="problem-number">Problem 0{index + 1}</span><h4>{problem.title}</h4><p>{problem.description}</p></article>)}</div>
            </article>)}
          </div>
        </section>

        <section className="problem-section problem-container"><div className="problem-risk-band"><h2>아이디어가 약해지는 신호</h2><ul><li>특정 사용자를 “모든 사람”이라고 말해요.</li><li>기존 대안이 무엇인지 설명하지 못해요.</li><li>AI가 없어도 같은 해결이 가능해요.</li><li>문제가 해결됐는지 확인할 지표가 없어요.</li><li>Unity나 대화형 AI가 문제보다 앞에 나와요.</li><li>인터뷰 없이 사용자의 불편을 추측해요.</li></ul></div></section>

        <section className="problem-section problem-container" id="questions">
          <div className="problem-section-head"><div><h2>팀 회의에서 먼저 답해요</h2><p>문제정의를 하나 고르기 전에 다섯 가지 질문을 함께 확인해요.</p></div></div>
          <div className="problem-questions">{['이 문제를 겪는 사람을 한 문장으로 특정할 수 있나요?', '그 사람은 지금 이 문제를 어떻게 해결하고 있나요?', '현재 방식이 실패하는 이유를 인터뷰로 확인했나요?', '문제가 해결됐는지 확인할 행동이나 지표가 있나요?', '비슷한 아이디어와 구별되는 문제 상황이 있나요?'].map((question, index) => <div className="problem-question" key={question}><span>0{index + 1}</span><p>{question}</p></div>)}</div>
        </section>
      </main>

      <footer className="problem-footer"><div className="problem-container problem-footer-grid"><div><strong>문제부터 찾아볼게요</strong><p>멋쟁이사자처럼 14기 해커톤을 위한 팀 문제정의 문서예요.</p></div><div><strong>바로가기</strong><div className="problem-footer-links"><a href="#tracks">트랙 비교</a><a href="#problems">문제정의 후보</a><a href="#questions">회의 질문</a></div></div><div><strong>원문 가이드</strong><div className="problem-footer-links"><a href="https://likelion.notion.site/14th-hackathon-guide" target="_blank" rel="noreferrer">멋사 해커톤 가이드 ↗</a><a href="/ideas">아이디어 적으러 가기</a></div></div></div></footer>
    </div>
  );
}
