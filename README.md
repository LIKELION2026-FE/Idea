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

Render 대시보드에서 직접 Web Service를 만들었다면 Build Command는 `npm run build --workspace apps/api`, Start Command는 `npm run start`로 설정할 수 있습니다. 루트 `package.json`의 `start`가 API workspace로 실행을 위임합니다.

Vercel 프론트엔드에는 `VITE_API_URL=https://<render-api-url>`을 설정합니다. Render API에는 아래 값을 설정합니다.

Vercel의 Root Directory를 저장소 루트(`/`)로 두면 루트 `vercel.json`을 사용하고, `apps/web`으로 두면 `apps/web/vercel.json`을 사용합니다. 두 설정 모두 지원하므로 Vercel에서 Root Directory를 변경했다면 별도의 workspace 명령을 입력하지 않아도 됩니다.

웹 경로는 `/`가 문제정의 메인이고 `/ideas`가 아이디어 보드입니다.

```env
DATABASE_URL=<supabase-session-pooler-url-with-sslmode-require>
OPENAI_API_KEY=<openai-key>
OPENAI_MODEL=gpt-4o-mini
TEAM_MEMBERS=member-1:팀원 1,member-2:팀원 2,member-3:팀원 3,member-4:팀원 4
CORS_ORIGIN=https://<vercel-project-url>
```

`DATABASE_URL`이 있으면 API가 PostgreSQL 저장소를 사용하고, 없으면 로컬 메모리 저장소로 동작합니다. `OPENAI_API_KEY`가 없으면 아이디어는 등록되지만 AI 분석은 대기 상태로 표시됩니다.

Render의 상시 실행 NestJS API에는 Supabase의 Session pooler 연결 문자열(기본 5432 포트)을 사용하세요. Transaction pooler(6543)는 서버리스·엣지 환경에 맞는 연결 방식입니다.
