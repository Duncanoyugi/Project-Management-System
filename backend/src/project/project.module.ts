import { Module } from '@nestjs/common';
import { ProjectsService } from './project.service';
import { ProjectsController } from './project.controller';

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
