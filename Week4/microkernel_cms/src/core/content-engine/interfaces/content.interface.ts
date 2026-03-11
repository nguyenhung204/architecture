export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
}

export interface ContentMeta {
  seo?: SeoMeta;
}

export interface MediaAsset {
  url: string;
  type: 'image' | 'video' | 'file';
  extractedAt: Date;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: Date;
}

export interface Content {
  id: string;
  title: string;
  body: string;
  type: 'article' | 'page' | 'post';
  status: 'draft' | 'published';
  meta: ContentMeta;
  mediaAssets: MediaAsset[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
