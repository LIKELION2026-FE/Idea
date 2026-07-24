import { Module } from '@nestjs/common';
import { createIdeasRepository } from './ideas.repository';
import { normalizeMemberList } from './ideas.schema';
import { IdeasController } from './ideas.controller';
import { IDEAS_REPOSITORY, IdeasService, MEMBER_LIST } from './ideas.service';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [IdeasController],
  providers: [
    IdeasService,
    {
      provide: IDEAS_REPOSITORY,
      useFactory: () => createIdeasRepository(process.env.DATABASE_URL),
    },
    {
      provide: MEMBER_LIST,
      useFactory: () => normalizeMemberList(process.env.TEAM_MEMBERS),
    },
  ],
})
export class IdeasModule {}
