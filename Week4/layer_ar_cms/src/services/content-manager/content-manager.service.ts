import { Injectable } from '@nestjs/common';
import { ContentRepository } from '../../persistence/repository/content.repository';
import { CacheService } from '../../persistence/cache/cache.service';
import { PluginManagerService } from '../plugin-manager/plugin-manager.service';
import type { IContent, EnrichedContent } from '../../common/interfaces/content.interface';
import { CreateContentDto } from '../../common/dto/create-content.dto';
import { UpdateContentDto } from '../../common/dto/update-content.dto';

@Injectable()
export class ContentManagerService {
  private readonly CACHE_ALL = 'content:all';
  private readonly cachePrefix = 'content:';

  constructor(
    private readonly contentRepo: ContentRepository,
    private readonly cache: CacheService,
    private readonly pluginManager: PluginManagerService,
  ) {}

  findAll(): IContent[] {
    const cached = this.cache.get<IContent[]>(this.CACHE_ALL);
    if (cached) return cached;
    const result = this.contentRepo.findAll();
    this.cache.set(this.CACHE_ALL, result);
    return result;
  }

  /**
   * Returns a single content item enriched with plugin data.
   * PluginManagerService.dispatchContentRead() calls onContentRead() on every
   * enabled plugin and collects the results — no EventBus, no dynamic hooks.
   */
  findById(id: string): EnrichedContent | undefined {
    const key = `${this.cachePrefix}${id}`;
    const cached = this.cache.get<IContent>(key);
    const content = cached ?? this.contentRepo.findById(id);
    if (!content) return undefined;
    if (!cached) this.cache.set(key, content);

    const pluginData = this.pluginManager.dispatchContentRead(content);
    return { ...content, _plugins: pluginData };
  }

  /**
   * Creates a content item then immediately fires dispatchContentCreate(),
   * returning the newly created content enriched with plugin output (e.g. SEO
   * meta, extracted media assets).
   */
  create(dto: CreateContentDto): EnrichedContent {
    const content = this.contentRepo.create(dto);
    this.cache.delete(this.CACHE_ALL);
    const pluginData = this.pluginManager.dispatchContentCreate(content);
    return { ...content, _plugins: pluginData };
  }

  update(id: string, dto: UpdateContentDto): IContent | undefined {
    const content = this.contentRepo.update(id, dto);
    if (content) {
      this.cache.delete(this.CACHE_ALL);
      this.cache.delete(`${this.cachePrefix}${id}`);
      this.pluginManager.dispatchContentUpdate(content);
    }
    return content;
  }

  delete(id: string): boolean {
    const deleted = this.contentRepo.delete(id);
    if (deleted) {
      this.cache.delete(this.CACHE_ALL);
      this.cache.delete(`${this.cachePrefix}${id}`);
    }
    return deleted;
  }
}

