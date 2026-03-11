import { Injectable } from '@nestjs/common';
import { BasePlugin } from '../plugins/base.plugin';
import { SeoPlugin } from '../plugins/seo.plugin';
import { MediaPlugin } from '../plugins/media.plugin';
import { CommentsPlugin } from '../plugins/comments.plugin';
import { ThemePlugin } from '../plugins/theme.plugin';
import { AuthPlugin } from '../plugins/auth.plugin';
import type { IPlugin } from '../../common/interfaces/plugin.interface';
import type { IContent } from '../../common/interfaces/content.interface';

/**
 * Plugin Manager — Business Logic Layer (Services Layer).
 *
 * LAYERED ARCHITECTURE CONSTRAINT:
 *   All plugin instances are instantiated directly here. Every time a new plugin
 *   is added, this service MUST be modified — this is the Open/Closed Principle
 *   violation that Layered Architecture is known for.
 *
 *   Compare with Microkernel: PluginRegistry.register(plugin) lets any plugin
 *   inject itself at runtime without touching existing code.
 *
 * DISPATCH MODEL:
 *   ContentManagerService calls dispatchContent*() methods.
 *   PluginManagerService iterates all enabled plugins and calls their lifecycle
 *   method directly. There is no EventBus, no hooks, no indirection.
 */
@Injectable()
export class PluginManagerService {
  private readonly plugins: BasePlugin[] = [
    new SeoPlugin(),       // enabled by default
    new MediaPlugin(),     // enabled by default
    new CommentsPlugin(),  // disabled by default (constructor sets enabled=false)
    new ThemePlugin(),     // enabled by default
    new AuthPlugin(),      // disabled by default (constructor sets enabled=false)
  ];

  // ─── IPlugin facade (admin endpoints) ────────────────────────────────────

  findAll(): IPlugin[] {
    return this.plugins;
  }

  findByName(name: string): IPlugin | undefined {
    return this.plugins.find((p) => p.name === name);
  }

  enable(name: string): IPlugin | undefined {
    const plugin = this.plugins.find((p) => p.name === name);
    if (!plugin) return undefined;
    plugin.enabled = true;
    return plugin;
  }

  disable(name: string): IPlugin | undefined {
    const plugin = this.plugins.find((p) => p.name === name);
    if (!plugin) return undefined;
    plugin.enabled = false;
    return plugin;
  }

  // ─── Lifecycle dispatch (called by ContentManagerService) ─────────────────

  /**
   * Runs all enabled plugins that implement onContentCreate.
   * Returns a map of { pluginName -> plugin output } for the caller to attach.
   */
  dispatchContentCreate(
    content: IContent,
  ): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const plugin of this.plugins) {
      if (plugin.enabled && plugin.onContentCreate) {
        result[plugin.name] = plugin.onContentCreate(content);
      }
    }
    return result;
  }

  /**
   * Runs all enabled plugins that implement onContentRead.
   * Returns a map of { pluginName -> plugin output } for the caller to attach.
   */
  dispatchContentRead(
    content: IContent,
  ): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const plugin of this.plugins) {
      if (plugin.enabled && plugin.onContentRead) {
        result[plugin.name] = plugin.onContentRead(content);
      }
    }
    return result;
  }

  /**
   * Runs all enabled plugins that implement onContentUpdate (fire-and-forget).
   */
  dispatchContentUpdate(content: IContent): void {
    for (const plugin of this.plugins) {
      if (plugin.enabled && plugin.onContentUpdate) {
        plugin.onContentUpdate(content);
      }
    }
  }

  /**
   * Delegates token validation to AuthPlugin (if enabled).
   * Falls back to accepting all tokens when auth plugin is disabled.
   */
  validateToken(token: string): { valid: boolean; reason?: string } {
    const authPlugin = this.plugins.find(
      (p) => p.name === 'auth' && p.enabled,
    );
    if (!authPlugin?.onAuthValidate) {
      return {
        valid: true,
        reason: 'Auth plugin is disabled — all tokens accepted.',
      };
    }
    return authPlugin.onAuthValidate(token);
  }
}

