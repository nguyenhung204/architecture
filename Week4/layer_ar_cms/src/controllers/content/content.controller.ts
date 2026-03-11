import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ContentManagerService } from '../../services/content-manager/content-manager.service';
import type { IContent } from '../../common/interfaces/content.interface';

/**
 * Web UI Controller — public-facing content endpoints.
 * Maps to the "Web UI" node in the Controllers Layer of the diagram.
 */
@Controller('content')
export class ContentController {
  constructor(private readonly contentManager: ContentManagerService) {}

  @Get()
  findAll(): IContent[] {
    return this.contentManager.findAll().filter((c) => c.status === 'published');
  }

  @Get(':id')
  findOne(@Param('id') id: string): IContent {
    const content = this.contentManager.findById(id);
    if (!content) throw new NotFoundException(`Content #${id} not found`);
    return content;
  }
}
