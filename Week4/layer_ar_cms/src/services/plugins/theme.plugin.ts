import { BasePlugin } from './base.plugin';
import type { IContent } from '../../common/interfaces/content.interface';

export class ThemePlugin extends BasePlugin {
  readonly name = 'theme';
  readonly version = '2.0.1';
  readonly description = 'Wraps content body in a full HTML theme template on read';

  onContentRead(content: IContent): Record<string, unknown> {
    const themed = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${content.title} | LayeredCMS</title>
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
    <small>Status: ${content.status} &bull; Published: ${content.createdAt.toISOString()}</small>
  </header>
  <main>
    ${content.body}
  </main>
  <footer>
    <p>Powered by <strong>LayeredCMS</strong> &bull; Theme Plugin v2.0.1</p>
  </footer>
</body>
</html>`;

    return { body: themed };
  }
}
