export class UpdateContentDto {
  title?: string;
  body?: string;
  type?: 'article' | 'page' | 'post';
  status?: 'draft' | 'published';
}
