import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ContentManagerService } from '../../services/content-manager/content-manager.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';

/**
 * REST API Controller — machine-readable API for external consumers.
 * Maps to the "REST API" node in the Controllers Layer of the diagram.
 * Provides read access to content and users; write operations go through AdminController.
 */
@Controller('api')
export class ApiController {
  constructor(
    private readonly contentManager: ContentManagerService,
    private readonly userManager: UserManagerService,
  ) {}

  // ─── Content ─────────────────────────────────────────────────────────────

  @Get('content')
  findAllContent() {
    return {
      data: this.contentManager.findAll(),
      total: this.contentManager.findAll().length,
    };
  }

  @Get('content/:id')
  findOneContent(@Param('id') id: string) {
    const content = this.contentManager.findById(id);
    if (!content) throw new NotFoundException(`Content #${id} not found`);
    return { data: content };
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  @Get('users')
  findAllUsers() {
    return {
      data: this.userManager.findAll(),
      total: this.userManager.findAll().length,
    };
  }

  @Get('users/:id')
  findOneUser(@Param('id') id: string) {
    const user = this.userManager.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return { data: user };
  }
}
