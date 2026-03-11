import { Injectable } from '@nestjs/common';
import { IContent } from '../../common/interfaces/content.interface';
import { IUser } from '../../common/interfaces/user.interface';

/**
 * ORM / Data Mapper — maps raw database records to domain entities and back.
 * In a real system this layer would handle TypeORM entities or Prisma models.
 */
@Injectable()
export class OrmService {
  toContentEntity(raw: IContent): IContent {
    return {
      id: raw.id,
      title: raw.title,
      body: raw.body,
      authorId: raw.authorId,
      status: raw.status,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  }

  toUserEntity(raw: IUser): IUser {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      role: raw.role,
      createdAt: new Date(raw.createdAt),
    };
  }

  toContentEntities(raws: IContent[]): IContent[] {
    return raws.map((r) => this.toContentEntity(r));
  }

  toUserEntities(raws: IUser[]): IUser[] {
    return raws.map((r) => this.toUserEntity(r));
  }
}
