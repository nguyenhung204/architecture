export interface IContent {
  id: string;
  title: string;
  body: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Content enriched with plugin data.
 * Returned by ContentManagerService.findById() and ContentManagerService.create()
 * after enabled plugins have processed the content.
 * _plugins is a map of { pluginName -> plugin output data }.
 */
export interface EnrichedContent extends IContent {
  _plugins: Record<string, Record<string, unknown>>;
}
