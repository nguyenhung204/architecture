import { BasePlugin } from './base.plugin';
import type { IContent } from '../../common/interfaces/content.interface';

interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: Date;
}

export class CommentsPlugin extends BasePlugin {
  readonly name = 'comments';
  readonly version = '0.9.0';
  readonly description = 'Appends a mock comment list when content is read';

  constructor() {
    super(false); // disabled by default — must be explicitly enabled via Admin API
  }

  onContentRead(content: IContent): Record<string, unknown> {
    const comments: Comment[] = [
      {
        id: `${content.id}-c1`,
        author: 'Alice',
        body: `Great article! Especially enjoyed reading about "${content.title}".`,
        createdAt: new Date('2026-03-01T09:00:00Z'),
      },
      {
        id: `${content.id}-c2`,
        author: 'Bob',
        body: 'Very informative, thanks for sharing.',
        createdAt: new Date('2026-03-02T14:30:00Z'),
      },
    ];
    return { comments };
  }
}
