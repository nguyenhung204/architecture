import { Injectable } from '@nestjs/common';
import { SqlDatabaseService } from '../../database/sql/sql-database.service';
import { OrmService } from '../orm/orm.service';
import { IContent } from '../../common/interfaces/content.interface';
import { CreateContentDto } from '../../common/dto/create-content.dto';
import { UpdateContentDto } from '../../common/dto/update-content.dto';

@Injectable()
export class ContentRepository {
  constructor(
    private readonly sql: SqlDatabaseService,
    private readonly orm: OrmService,
  ) {}

  findAll(): IContent[] {
    return this.orm.toContentEntities(this.sql.getContents());
  }

  findById(id: string): IContent | undefined {
    const raw = this.sql.getContentById(id);
    return raw ? this.orm.toContentEntity(raw) : undefined;
  }

  create(dto: CreateContentDto): IContent {
    const now = new Date();
    const content: IContent = {
      id: this.sql.nextId('content'),
      title: dto.title,
      body: dto.body,
      authorId: dto.authorId,
      status: dto.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
    };
    return this.orm.toContentEntity(this.sql.insertContent(content));
  }

  update(id: string, dto: UpdateContentDto): IContent | undefined {
    const partial: Partial<IContent> = { ...dto, updatedAt: new Date() };
    const raw = this.sql.updateContent(id, partial);
    return raw ? this.orm.toContentEntity(raw) : undefined;
  }

  delete(id: string): boolean {
    return this.sql.deleteContent(id);
  }
}
