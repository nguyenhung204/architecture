import { Injectable } from '@nestjs/common';
import { PluginRegistryService } from './core/plugin-registry/plugin-registry.service';

@Injectable()
export class AppService {
  constructor(private readonly pluginRegistry: PluginRegistryService) {}

  getCmsInfo(): object {
    const plugins = this.pluginRegistry.getAll();
    return {
      name: 'MicrokernelCMS',
      version: '1.0.0',
      architecture: 'Microkernel',
      description:
        'A Plugin-based CMS built with NestJS demonstrating Microkernel Architecture.',
      endpoints: {
        plugins: 'GET /api/plugins',
        content: 'GET /api/content',
      },
      plugins: {
        total: plugins.length,
        enabled: plugins.filter((p) => p.enabled).length,
        list: plugins.map((p) => ({
          name: p.name,
          version: p.plugin.version,
          enabled: p.enabled,
        })),
      },
    };
  }
}
