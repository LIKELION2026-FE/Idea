import { Module } from '@nestjs/common';
import { OpenAIAnalysisService } from './openai-analysis.service';

@Module({
  providers: [OpenAIAnalysisService],
  exports: [OpenAIAnalysisService],
})
export class AnalysisModule {}
