import { Injectable } from '@nestjs/common';
import { IContent } from '../../common/interfaces/content.interface';
import { IUser } from '../../common/interfaces/user.interface';

@Injectable()
export class SqlDatabaseService {
  private contents: IContent[] = [
    {
      id: '1',
      title: 'Getting Started with CMS',
      body: 'This is the first article published on our CMS platform.',
      authorId: '1',
      status: 'published',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: '2',
      title: 'Layered Architecture Overview',
      body: 'Layered architecture organises a system into hierarchical layers, each communicating only with the layer directly below it.',
      authorId: '2',
      status: 'published',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-20'),
    },
    {
      id: '3',
      title: 'Draft: Plugin System Design',
      body: 'Exploring how the Plugin Manager fits inside the Business Logic Layer.',
      authorId: '1',
      status: 'draft',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01'),
    },
  ];

  private users: IUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@cms.local',
      role: 'admin',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: '2',
      username: 'editor',
      email: 'editor@cms.local',
      role: 'editor',
      createdAt: new Date('2026-01-02'),
    },
  ];

  getContents(): IContent[] {
    return this.contents;
  }

  getContentById(id: string): IContent | undefined {
    return this.contents.find((c) => c.id === id);
  }

  insertContent(content: IContent): IContent {
    this.contents.push(content);
    return content;
  }

  updateContent(id: string, partial: Partial<IContent>): IContent | undefined {
    const index = this.contents.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.contents[index] = { ...this.contents[index], ...partial, id };
    return this.contents[index];
  }

  deleteContent(id: string): boolean {
    const index = this.contents.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.contents.splice(index, 1);
    return true;
  }

  getUsers(): IUser[] {
    return this.users;
  }

  getUserById(id: string): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  insertUser(user: IUser): IUser {
    this.users.push(user);
    return user;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  nextId(type: 'content' | 'user'): string {
    if (type === 'content') {
      const max = this.contents.reduce((m, c) => Math.max(m, Number(c.id)), 0);
      return String(max + 1);
    }
    const max = this.users.reduce((m, u) => Math.max(m, Number(u.id)), 0);
    return String(max + 1);
  }
}
