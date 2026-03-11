import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { PluginRegistryService } from '../core/plugin-registry/plugin-registry.service';
import { ThemePlugin } from './theme.plugin';
import { SeoPlugin } from './seo.plugin';
import { AuthPlugin } from './auth.plugin';
import { MediaPlugin } from './media.plugin';
import { CommentsPlugin } from './comments.plugin';

@Module({
  imports: [CoreModule],
  providers: [ThemePlugin, SeoPlugin, AuthPlugin, MediaPlugin, CommentsPlugin],
})
export class PluginsModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(PluginsModule.name);

  constructor(
    private readonly pluginRegistry: PluginRegistryService,
    private readonly themePlugin: ThemePlugin,
    private readonly seoPlugin: SeoPlugin,
    private readonly authPlugin: AuthPlugin,
    private readonly mediaPlugin: MediaPlugin,
    private readonly commentsPlugin: CommentsPlugin,
  ) {}

  onApplicationBootstrap(): void {
    const plugins = [
      this.themePlugin,
      this.seoPlugin,
      this.authPlugin,
      this.mediaPlugin,
      this.commentsPlugin,
    ];

    plugins.forEach((plugin) => this.pluginRegistry.register(plugin));

    this.logger.log(
      `${plugins.length} plugins loaded: ${plugins.map((p) => p.name).join(', ')}`,
    );
  }
}
