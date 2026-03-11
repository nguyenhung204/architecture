import { BasePlugin } from './base.plugin';
import type { IContent } from '../../common/interfaces/content.interface';

export class SeoPlugin extends BasePlugin {
  readonly name = 'seo';
  readonly version = '1.0.0';
  readonly description = 'Auto-generates SEO meta tags on content create/update';

  onContentCreate(content: IContent): Record<string, unknown> {
    return this.generateMeta(content);
  }

  onContentUpdate(content: IContent): void {
    this.generateMeta(content);
  }

  private generateMeta(content: IContent): Record<string, unknown> {
    const plainText = content.body
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = plainText.split(' ').filter(Boolean);
    const keywords = [...new Set(words.filter((w) => w.length > 4))].slice(0, 10);
    const description =
      words.slice(0, 25).join(' ') + (words.length > 25 ? '...' : '');

    return {
      meta: {
        title: `${content.title} | LayeredCMS`,
        description,
        keywords,
      },
    };
  }
}
