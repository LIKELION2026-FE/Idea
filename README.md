# BrainStorm

멋쟁이사자처럼 해커톤 팀 아이디어 보드입니다.

팀원이 아이디어를 제출하면 전체 보드에서 함께 확인하고, OpenAI API가 문제의 강점·약점·차별화 질문·다듬은 문제정의를 분석합니다.

## 시작하기

```bash
npm install
cp .env.example .env
npm run dev:api
npm run dev:web
```

API는 `http://localhost:3001`, 웹은 보통 `http://localhost:5173`에서 실행됩니다. 해당 포트가 사용 중이면 Vite가 `5174`로 자동 변경합니다.

`DATABASE_URL`이 비어 있으면 API는 메모리 저장소를 사용합니다. PostgreSQL을 연결하려면 `.env`에 연결 문자열을 추가하세요. OpenAI 키를 추가하기 전에도 아이디어 제출은 가능하며, 분석은 대기 상태로 표시됩니다.

`CORS_ORIGIN`은 쉼표로 여러 웹 origin을 지정할 수 있습니다.

## 배포 환경변수

이 저장소는 아래 배포 구성을 기준으로 준비되어 있습니다.

- Vercel: 루트의 `vercel.json`으로 `apps/web`을 빌드합니다.
- Render: 루트의 `render.yaml`으로 `apps/api`를 NestJS 웹 서비스로 실행합니다.
- Supabase: `supabase/migrations/20260724000000_create_ideas.sql`을 SQL Editor 또는 Supabase CLI로 적용합니다.

Vercel 프론트엔드에는 `VITE_API_URL=https://<render-api-url>`을 설정합니다. Render API에는 아래 값을 설정합니다.

```env
DATABASE_URL=<supabase-connection-pooler-url>
OPENAI_API_KEY=<openai-key>
OPENAI_MODEL=gpt-4o-mini
TEAM_MEMBERS=member-1:팀원 1,member-2:팀원 2,member-3:팀원 3,member-4:팀원 4
CORS_ORIGIN=https://<vercel-project-url>
```

`DATABASE_URL`이 있으면 API가 PostgreSQL 저장소를 사용하고, 없으면 로컬 메모리 저장소로 동작합니다. `OPENAI_API_KEY`가 없으면 아이디어는 등록되지만 AI 분석은 대기 상태로 표시됩니다.
