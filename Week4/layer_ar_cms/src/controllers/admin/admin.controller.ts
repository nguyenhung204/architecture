import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentManagerService } from '../../services/content-manager/content-manager.service';
import { PluginManagerService } from '../../services/plugin-manager/plugin-manager.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { CreateContentDto } from '../../common/dto/create-content.dto';
import { UpdateContentDto } from '../../common/dto/update-content.dto';
import { CreateUserDto } from '../../common/dto/create-user.dto';

/**
 * Admin Panel Controller — full CRUD access for content, plugins and users.
 * Maps to the "Admin Panel" node in the Controllers Layer of the diagram.
 * Admin Panel communicates with all three Business Logic services:
 * Content Manager, Plugin Manager, and User Manager.
 */
@Controller('admin')
export class AdminController {
  constructor(
    private readonly contentManager: ContentManagerService,
    private readonly pluginManager: PluginManagerService,
    private readonly userManager: UserManagerService,
  ) {}

  // ─── Content ─────────────────────────────────────────────────────────────

  @Get('content')
  getAllContent() {
    return this.contentManager.findAll();
  }

  @Get('content/:id')
  getContent(@Param('id') id: string) {
    const content = this.contentManager.findById(id);
    if (!content) throw new NotFoundException(`Content #${id} not found`);
    return content;
  }

  @Post('content')
  createContent(@Body() dto: CreateContentDto) {
    return this.contentManager.create(dto);
  }

  @Put('content/:id')
  updateContent(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    const content = this.contentManager.update(id, dto);
    if (!content) throw new NotFoundException(`Content #${id} not found`);
    return content;
  }

  @Delete('content/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContent(@Param('id') id: string) {
    const deleted = this.contentManager.delete(id);
    if (!deleted) throw new NotFoundException(`Content #${id} not found`);
  }

  // ─── Plugins ─────────────────────────────────────────────────────────────

  @Get('plugins')
  getAllPlugins() {
    return this.pluginManager.findAll();
  }

  @Get('plugins/:name')
  getPlugin(@Param('name') name: string) {
    const plugin = this.pluginManager.findByName(name);
    if (!plugin) throw new NotFoundException(`Plugin "${name}" not found`);
    return plugin;
  }

  @Post('plugins/:name/enable')
  enablePlugin(@Param('name') name: string) {
    const plugin = this.pluginManager.enable(name);
    if (!plugin) throw new NotFoundException(`Plugin "${name}" not found`);
    return plugin;
  }

  @Post('plugins/:name/disable')
  disablePlugin(@Param('name') name: string) {
    const plugin = this.pluginManager.disable(name);
    if (!plugin) throw new NotFoundException(`Plugin "${name}" not found`);
    return plugin;
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  /**
   * Validate a token through the Auth Plugin.
   * If the auth plugin is disabled, all tokens are accepted.
   * Enable it first: POST /admin/plugins/auth/enable
   */
  @Post('auth/validate')
  validateToken(@Body() body: { token: string }) {
    return this.pluginManager.validateToken(body.token);
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  @Get('users')
  getAllUsers() {
    return this.userManager.findAll();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    const user = this.userManager.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.userManager.create(dto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: string) {
    const deleted = this.userManager.delete(id);
    if (!deleted) throw new NotFoundException(`User #${id} not found`);
  }
}
