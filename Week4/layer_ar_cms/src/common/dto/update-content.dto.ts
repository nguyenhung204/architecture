export class UpdateContentDto {
  title?: string;
  body?: string;
  status?: 'draft' | 'published' | 'archived';
}
