import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import { ApiKeyGuard } from '../security/guards/api-key.guard';

@Controller('plugins')
export class PluginRegistryController {
  constructor(private readonly pluginRegistry: PluginRegistryService) {}

  @Get()
  listPlugins() {
    return this.pluginRegistry.getAll().map(({ name, plugin, enabled, loadedAt }) => ({
      name,
      version: plugin.version,
      description: plugin.description,
      enabled,
      loadedAt,
    }));
  }

  @Post(':name/enable')
  @UseGuards(ApiKeyGuard)
  enablePlugin(@Param('name') name: string) {
    try {
      this.pluginRegistry.enable(name);
      return { success: true, message: `Plugin "${name}" enabled.` };
    } catch {
      throw new NotFoundException(`Plugin "${name}" not found.`);
    }
  }

  @Post(':name/disable')
  @UseGuards(ApiKeyGuard)
  disablePlugin(@Param('name') name: string) {
    try {
      this.pluginRegistry.disable(name);
      return { success: true, message: `Plugin "${name}" disabled.` };
    } catch {
      throw new NotFoundException(`Plugin "${name}" not found.`);
    }
  }
}
