# Team Idea Board MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a team idea board where members submit hackathon ideas, see each other's submissions, and receive structured AI feedback.

**Architecture:** Use an npm-workspaces monorepo with a Vite React client and a NestJS API. The API exposes member, idea, and analysis endpoints, stores data in PostgreSQL when `DATABASE_URL` exists, and uses an in-memory repository for local development without credentials. OpenAI analysis is server-side only and remains pending when `OPENAI_API_KEY` is absent.

**Tech Stack:** React, Vite, TypeScript, NestJS, PostgreSQL via `pg`, OpenAI Node SDK, Vitest, CSS tokens derived from `design.md`.

## Global Constraints

- Keep API keys server-side; never expose `OPENAI_API_KEY` to the browser.
- Use Korean, clear, concise, friendly, respectful copy and concrete recovery paths.
- Keep MVP scope to member selection, idea submission, shared board, structured AI analysis, and track filtering.
- Do not add social login, comments, realtime sockets, vector search, file uploads, or ranking in the first version.
- Support local development without database credentials through an in-memory repository.

---

### Task 1: Workspace and shared configuration

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `README.md`
- Create: `apps/api/tsconfig.json`
- Create: `apps/web/tsconfig.json`

- [ ] **Step 1: Write the workspace configuration and environment contract**
- [ ] **Step 2: Verify the files contain separate browser and server environment variables**

### Task 2: API validation and repository tests

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/src/ideas/ideas.schema.ts`
- Create: `apps/api/src/ideas/ideas.schema.spec.ts`

**Interfaces:**
- `validateIdeaInput(input: unknown): { valid: true; value: IdeaInput } | { valid: false; message: string }`
- `normalizeMemberList(value?: string): Member[]`

- [ ] **Step 1: Write failing tests for required idea fields and member parsing**
- [ ] **Step 2: Run `npm test --workspace apps/api` and verify the tests fail because the functions do not exist**
- [ ] **Step 3: Implement the minimal validation and member parsing functions**
- [ ] **Step 4: Run the API tests and verify they pass**

### Task 3: NestJS API and persistence

**Files:**
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/ideas/ideas.types.ts`
- Create: `apps/api/src/ideas/ideas.repository.ts`
- Create: `apps/api/src/ideas/ideas.service.ts`
- Create: `apps/api/src/ideas/ideas.controller.ts`
- Create: `apps/api/src/ideas/ideas.module.ts`
- Create: `apps/api/src/analysis/openai-analysis.service.ts`
- Create: `apps/api/src/analysis/analysis.module.ts`
- Create: `apps/api/db/schema.sql`

**Interfaces:**
- `GET /health`
- `GET /members`
- `GET /ideas?track=all`
- `POST /ideas`
- `POST /ideas/:id/analyze`

- [ ] **Step 1: Implement repository interfaces and memory repository**
- [ ] **Step 2: Add PostgreSQL repository selected by `DATABASE_URL`**
- [ ] **Step 3: Add idea CRUD endpoints with validation and friendly errors**
- [ ] **Step 4: Add OpenAI structured analysis with a pending fallback when no key exists**
- [ ] **Step 5: Run API typecheck and tests**

### Task 4: React idea board

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/api.ts`
- Create: `apps/web/src/types.ts`
- Create: `apps/web/src/styles.css`

**Interfaces:**
- Member selection before submission
- Idea form with title, track, target user, problem, current workaround, and evidence
- Shared board with track filter and AI result states
- Retry analysis action for pending ideas

- [ ] **Step 1: Build the form and board against typed API models**
- [ ] **Step 2: Apply the existing Airbnb-inspired tokens and UX-writing rules**
- [ ] **Step 3: Add loading, empty, error, pending, and success states**
- [ ] **Step 4: Run the web build**

### Task 5: Local run and delivery verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Install workspace dependencies**
- [ ] **Step 2: Run API and web dev servers**
- [ ] **Step 3: Verify health endpoint and client build output**
- [ ] **Step 4: Report the local URLs and required environment variables**
