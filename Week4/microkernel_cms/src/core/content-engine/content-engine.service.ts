import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventBusService } from '../event-bus/event-bus.service';
import {
  Comment,
  Content,
  ContentMeta,
  MediaAsset,
} from './interfaces/content.interface';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { CmsEvent } from '../interfaces/event.interface';

@Injectable()
export class ContentEngineService {
  private readonly store = new Map<string, Content>();

  constructor(private readonly eventBus: EventBusService) {}

  async create(dto: CreateContentDto): Promise<Content> {
    const now = new Date();
    const content: Content = {
      id: randomUUID(),
      title: dto.title,
      body: dto.body,
      type: dto.type ?? 'article',
      status: dto.status ?? 'draft',
      meta: {},
      mediaAssets: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    // Persist before emitting so plugins can reference the stored record
    this.store.set(content.id, content);

    // content.created → SEO, Media plugins augment persistent data
    const results = await this.eventBus.emit(CmsEvent.CONTENT_CREATED, content);
    this.mergePluginResults(content, results);

    return content;
  }

  async findAll(): Promise<Content[]> {
    return [...this.store.values()];
  }

  async findOne(id: string): Promise<Content> {
    const stored = this.store.get(id);
    if (!stored) throw new NotFoundException(`Content "${id}" not found.`);

    // Create a view-level copy so display-only augmentations (Theme, Comments)
    // are not persisted back into the store.
    const view: Content = {
      ...stored,
      meta: { ...stored.meta },
      mediaAssets: [...stored.mediaAssets],
      comments: [...stored.comments],
    };

    // content.read → Theme plugin wraps body, Comments plugin appends comments
    const results = await this.eventBus.emit(CmsEvent.CONTENT_READ, view);
    this.mergePluginResults(view, results);

    return view;
  }

  async update(id: string, dto: UpdateContentDto): Promise<Content> {
    const content = this.store.get(id);
    if (!content) throw new NotFoundException(`Content "${id}" not found.`);

    if (dto.title !== undefined) content.title = dto.title;
    if (dto.body !== undefined) content.body = dto.body;
    if (dto.type !== undefined) content.type = dto.type;
    if (dto.status !== undefined) content.status = dto.status;
    content.updatedAt = new Date();

    // content.updated → SEO plugin re-generates meta
    const results = await this.eventBus.emit(CmsEvent.CONTENT_UPDATED, content);
    this.mergePluginResults(content, results);

    return content;
  }

  async remove(id: string): Promise<{ id: string; deleted: boolean }> {
    const content = this.store.get(id);
    if (!content) throw new NotFoundException(`Content "${id}" not found.`);

    await this.eventBus.emit(CmsEvent.CONTENT_DELETED, content);
    this.store.delete(id);

    return { id, deleted: true };
  }

  private mergePluginResults(content: Content, results: any[]): void {
    for (const result of results) {
      if (!result || typeof result !== 'object') continue;

      if (result.meta && typeof result.meta === 'object') {
        content.meta = { ...content.meta, ...(result.meta as ContentMeta) };
      }
      if (Array.isArray(result.mediaAssets)) {
        content.mediaAssets = [
          ...content.mediaAssets,
          ...(result.mediaAssets as MediaAsset[]),
        ];
      }
      if (Array.isArray(result.comments)) {
        content.comments = [
          ...content.comments,
          ...(result.comments as Comment[]),
        ];
      }
      if (result.body !== undefined) {
        content.body = result.body as string;
      }
    }
  }
}
