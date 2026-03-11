import { Injectable } from '@nestjs/common';
import { BasePlugin } from './base.plugin';
import { IEventBus, CmsEvent } from '../core/interfaces/event.interface';
import {
  Comment,
  Content,
} from '../core/content-engine/interfaces/content.interface';

@Injectable()
export class CommentsPlugin extends BasePlugin {
  readonly name = 'comments';
  readonly version = '1.0.0';
  readonly description = 'Appends a mock comment list when content is read';

  onLoad(eventBus: IEventBus): void {
    this.register(eventBus, CmsEvent.CONTENT_READ, this.loadComments);
  }

  private loadComments(content: Content): { comments: Comment[] } {
    return {
      comments: [
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
      ],
    };
  }
}
