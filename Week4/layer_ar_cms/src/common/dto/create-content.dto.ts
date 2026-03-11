export class CreateContentDto {
  title: string;
  body: string;
  authorId: string;
  status?: 'draft' | 'published' | 'archived';
}
