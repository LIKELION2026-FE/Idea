import { Module } from '@nestjs/common';
import { IdeasModule } from './ideas/ideas.module';

@Module({
  imports: [IdeasModule],
})
export class AppModule {}
