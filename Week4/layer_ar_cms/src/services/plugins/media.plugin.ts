import { BasePlugin } from './base.plugin';
import type { IContent } from '../../common/interfaces/content.interface';

interface MediaAsset {
  url: string;
  type: 'image' | 'video';
  extractedAt: Date;
}

export class MediaPlugin extends BasePlugin {
  readonly name = 'media';
  readonly version = '1.2.0';
  readonly description = 'Extracts and attaches image/video asset metadata from content body';

  onContentCreate(content: IContent): Record<string, unknown> {
    const assets: MediaAsset[] = [];
    const now = new Date();

    const imgMatches = [...content.body.matchAll(/src=["']([^"']+)["']/gi)];
    for (const match of imgMatches) {
      assets.push({ url: match[1], type: 'image', extractedAt: now });
    }

    const videoMatches = [
      ...content.body.matchAll(/https?:\/\/[^\s"'<>]+\.(mp4|webm|ogg)/gi),
    ];
    for (const match of videoMatches) {
      assets.push({ url: match[0], type: 'video', extractedAt: now });
    }

    return { mediaAssets: assets };
  }
}
