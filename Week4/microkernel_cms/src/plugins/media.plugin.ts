import { Injectable } from '@nestjs/common';
import { BasePlugin } from './base.plugin';
import { IEventBus, CmsEvent } from '../core/interfaces/event.interface';
import {
  Content,
  MediaAsset,
} from '../core/content-engine/interfaces/content.interface';

@Injectable()
export class MediaPlugin extends BasePlugin {
  readonly name = 'media';
  readonly version = '1.0.0';
  readonly description = 'Extracts and attaches image/video asset metadata from content body';

  onLoad(eventBus: IEventBus): void {
    this.register(eventBus, CmsEvent.CONTENT_CREATED, this.extractMedia);
  }

  private extractMedia(content: Content): { mediaAssets: MediaAsset[] } {
    const mediaAssets: MediaAsset[] = [];
    const now = new Date();

    // Extract <img src="..."> URLs
    const imgMatches = [...content.body.matchAll(/src=["']([^"']+)["']/gi)];
    for (const match of imgMatches) {
      mediaAssets.push({ url: match[1], type: 'image', extractedAt: now });
    }

    // Extract bare video file URLs
    const videoMatches = [
      ...content.body.matchAll(/https?:\/\/[^\s"'<>]+\.(mp4|webm|ogg)/gi),
    ];
    for (const match of videoMatches) {
      mediaAssets.push({ url: match[0], type: 'video', extractedAt: now });
    }

    return { mediaAssets };
  }
}
