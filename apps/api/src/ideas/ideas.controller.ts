import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IdeasService } from './ideas.service';

@Controller()
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'brainstorm-api' };
  }

  @Get('members')
  members() {
    return this.ideasService.getMembers();
  }

  @Get('ideas')
  ideas(@Query('track') track?: string) {
    return this.ideasService.list(track);
  }

  @Post('ideas')
  create(@Body() body: { memberId?: string; idea?: unknown }) {
    return this.ideasService.create(body.memberId || '', body.idea);
  }

  @Post('ideas/:id/analyze')
  analyze(@Param('id') id: string) {
    return this.ideasService.analyze(id);
  }
}
