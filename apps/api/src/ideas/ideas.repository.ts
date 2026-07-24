import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { IdeaAnalysis, IdeaInput, IdeaRecord } from './ideas.types';

export interface IdeasRepository {
  list(track?: string): Promise<IdeaRecord[]>;
  findById(id: string): Promise<IdeaRecord | null>;
  create(memberId: string, memberName: string, input: IdeaInput): Promise<IdeaRecord>;
  updateAnalysis(id: string, status: IdeaRecord['analysisStatus'], analysis: IdeaAnalysis | null, message?: string): Promise<IdeaRecord>;
}

export class MemoryIdeasRepository implements IdeasRepository {
  private readonly ideas = new Map<string, IdeaRecord>();

  async list(track?: string): Promise<IdeaRecord[]> {
    return [...this.ideas.values()]
      .filter((idea) => !track || track === 'all' || idea.track === track)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<IdeaRecord | null> {
    return this.ideas.get(id) ?? null;
  }

  async create(memberId: string, memberName: string, input: IdeaInput): Promise<IdeaRecord> {
    const record: IdeaRecord = {
      ...input,
      id: randomUUID(),
      memberId,
      memberName,
      createdAt: new Date().toISOString(),
      analysisStatus: 'pending',
      analysis: null,
    };
    this.ideas.set(record.id, record);
    return record;
  }

  async updateAnalysis(id: string, status: IdeaRecord['analysisStatus'], analysis: IdeaAnalysis | null, message?: string): Promise<IdeaRecord> {
    const existing = this.ideas.get(id);
    if (!existing) throw new Error('IDEA_NOT_FOUND');
    const updated = { ...existing, analysisStatus: status, analysis, analysisMessage: message };
    this.ideas.set(id, updated);
    return updated;
  }
}

export class PostgresIdeasRepository implements IdeasRepository {
  constructor(private readonly pool: Pool) {}

  async list(track?: string): Promise<IdeaRecord[]> {
    const query = `
      SELECT id, member_id AS "memberId", member_name AS "memberName", track, title,
             target_user AS "targetUser", problem, current_solution AS "currentSolution",
             evidence, created_at AS "createdAt", analysis_status AS "analysisStatus",
             analysis, analysis_message AS "analysisMessage"
      FROM ideas
      ${track && track !== 'all' ? 'WHERE track = $1' : ''}
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query<IdeaRecord>(query, track && track !== 'all' ? [track] : []);
    return result.rows;
  }

  async findById(id: string): Promise<IdeaRecord | null> {
    const result = await this.pool.query<IdeaRecord>(
      `SELECT id, member_id AS "memberId", member_name AS "memberName", track, title,
              target_user AS "targetUser", problem, current_solution AS "currentSolution",
              evidence, created_at AS "createdAt", analysis_status AS "analysisStatus",
              analysis, analysis_message AS "analysisMessage"
       FROM ideas WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(memberId: string, memberName: string, input: IdeaInput): Promise<IdeaRecord> {
    const id = randomUUID();
    const result = await this.pool.query<IdeaRecord>(
      `INSERT INTO ideas (id, member_id, member_name, track, title, target_user, problem, current_solution, evidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, member_id AS "memberId", member_name AS "memberName", track, title,
                 target_user AS "targetUser", problem, current_solution AS "currentSolution",
                 evidence, created_at AS "createdAt", analysis_status AS "analysisStatus",
                 analysis, analysis_message AS "analysisMessage"`,
      [id, memberId, memberName, input.track, input.title, input.targetUser, input.problem, input.currentSolution, input.evidence],
    );
    return result.rows[0];
  }

  async updateAnalysis(id: string, status: IdeaRecord['analysisStatus'], analysis: IdeaAnalysis | null, message?: string): Promise<IdeaRecord> {
    const result = await this.pool.query<IdeaRecord>(
      `UPDATE ideas SET analysis_status = $2, analysis = $3, analysis_message = $4
       WHERE id = $1
       RETURNING id, member_id AS "memberId", member_name AS "memberName", track, title,
                 target_user AS "targetUser", problem, current_solution AS "currentSolution",
                 evidence, created_at AS "createdAt", analysis_status AS "analysisStatus",
                 analysis, analysis_message AS "analysisMessage"`,
      [id, status, analysis ? JSON.stringify(analysis) : null, message ?? null],
    );
    if (!result.rows[0]) throw new Error('IDEA_NOT_FOUND');
    return result.rows[0];
  }
}

export async function createIdeasRepository(databaseUrl?: string): Promise<IdeasRepository> {
  if (!databaseUrl) return new MemoryIdeasRepository();

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    ssl: /sslmode=require/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      track TEXT NOT NULL,
      title TEXT NOT NULL,
      target_user TEXT NOT NULL,
      problem TEXT NOT NULL,
      current_solution TEXT NOT NULL DEFAULT '',
      evidence TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      analysis_status TEXT NOT NULL DEFAULT 'pending',
      analysis JSONB,
      analysis_message TEXT
    )
  `);
  return new PostgresIdeasRepository(pool);
}
