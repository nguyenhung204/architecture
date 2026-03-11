import type { IPlugin } from '../../common/interfaces/plugin.interface';
import type { IContent } from '../../common/interfaces/content.interface';

/**
 * Base class for all plugins in LAYERED Architecture.
 *
 * KEY DIFFERENCE vs Microkernel:
 *   - Microkernel: plugin.onLoad(eventBus) → plugin self-registers its own handlers
 *                  → PluginRegistry never needs to know plugin internals
 *   - Layered:     PluginManagerService holds BasePlugin[] directly and calls
 *                  onContentCreate / onContentRead / onContentUpdate explicitly
 *                  → tight coupling: adding a new plugin requires modifying
 *                    PluginManagerService (violates Open/Closed Principle)
 *
 * There is NO EventBus — plugins cannot intercept the system dynamically.
 * All dispatch logic lives in PluginManagerService.
 */
export abstract class BasePlugin implements IPlugin {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description: string;
  enabled: boolean;

  constructor(enabledByDefault = true) {
    this.enabled = enabledByDefault;
  }

  /** Called after a new content item is persisted. */
  onContentCreate?(content: IContent): Record<string, unknown>;

  /** Called when a content item is read (single-item fetch). */
  onContentRead?(content: IContent): Record<string, unknown>;

  /** Called after a content item is updated in the persistence layer. */
  onContentUpdate?(content: IContent): void;

  /** Called when a token needs validation (only AuthPlugin implements this). */
  onAuthValidate?(token: string): { valid: boolean; reason?: string };
}
