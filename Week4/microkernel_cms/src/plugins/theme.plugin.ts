import { Injectable } from '@nestjs/common';
import { BasePlugin } from './base.plugin';
import { IEventBus } from '../core/interfaces/event.interface';
import { CmsEvent } from '../core/interfaces/event.interface';
import { Content } from '../core/content-engine/interfaces/content.interface';

@Injectable()
export class ThemePlugin extends BasePlugin {
  readonly name = 'theme';
  readonly version = '1.0.0';
  readonly description = 'Wraps content body in a full HTML theme template on read';

  onLoad(eventBus: IEventBus): void {
    this.register(eventBus, CmsEvent.CONTENT_READ, this.applyTheme);
  }

  private applyTheme(content: Content): { body: string } {
    const themed = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${content.title} | Microkernel CMS</title>
  <style>
    body { font-family: sans-serif; max-width: 820px; margin: 2rem auto; padding: 1rem; color: #222; }
    header { border-bottom: 2px solid #333; padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
    header h1 { margin: 0 0 0.25rem; }
    header small { color: #666; }
    main { line-height: 1.7; }
    footer { border-top: 1px solid #ddd; margin-top: 2rem; padding-top: 0.75rem; font-size: 0.8rem; color: #888; }
  </style>
</head>
<body>
  <header>
    <h1>${content.title}</h1>
    <small>Type: ${content.type} &bull; Status: ${content.status} &bull; Published: ${content.createdAt.toISOString()}</small>
  </header>
  <main>
    ${content.body}
  </main>
  <footer>
    <p>Powered by <strong>MicrokernelCMS</strong> &bull; Theme Plugin v1.0.0</p>
  </footer>
</body>
</html>`;

    return { body: themed };
  }
}
