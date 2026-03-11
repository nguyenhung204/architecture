import { Injectable } from '@nestjs/common';
import { BasePlugin } from './base.plugin';
import { IEventBus, CmsEvent } from '../core/interfaces/event.interface';
import { Content } from '../core/content-engine/interfaces/content.interface';

@Injectable()
export class SeoPlugin extends BasePlugin {
  readonly name = 'seo';
  readonly version = '1.0.0';
  readonly description = 'Auto-generates SEO meta tags on content create/update';

  onLoad(eventBus: IEventBus): void {
    this.register(eventBus, CmsEvent.CONTENT_CREATED, this.generateMeta);
    this.register(eventBus, CmsEvent.CONTENT_UPDATED, this.generateMeta);
  }

  private generateMeta(content: Content): { meta: object } {
    const plainText = content.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plainText.split(' ').filter(Boolean);

    const keywords = [...new Set(words.filter((w) => w.length > 4))].slice(0, 10);
    const descriptionWords = words.slice(0, 25);
    const description =
      descriptionWords.join(' ') + (words.length > 25 ? '…' : '');

    return {
      meta: {
        seo: {
          title: `${content.title} | MicrokernelCMS`,
          description,
          keywords,
        },
      },
    };
  }
}
