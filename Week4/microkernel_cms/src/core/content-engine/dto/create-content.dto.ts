export class CreateContentDto {
  title: string;
  body: string;
  type?: 'article' | 'page' | 'post';
  status?: 'draft' | 'published';
}
