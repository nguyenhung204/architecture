import { Injectable } from '@nestjs/common';
import { SqlDatabaseService } from '../../database/sql/sql-database.service';
import { OrmService } from '../orm/orm.service';
import { IUser } from '../../common/interfaces/user.interface';
import { CreateUserDto } from '../../common/dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    private readonly sql: SqlDatabaseService,
    private readonly orm: OrmService,
  ) {}

  findAll(): IUser[] {
    return this.orm.toUserEntities(this.sql.getUsers());
  }

  findById(id: string): IUser | undefined {
    const raw = this.sql.getUserById(id);
    return raw ? this.orm.toUserEntity(raw) : undefined;
  }

  create(dto: CreateUserDto): IUser {
    const user: IUser = {
      id: this.sql.nextId('user'),
      username: dto.username,
      email: dto.email,
      role: dto.role ?? 'viewer',
      createdAt: new Date(),
    };
    return this.orm.toUserEntity(this.sql.insertUser(user));
  }

  delete(id: string): boolean {
    return this.sql.deleteUser(id);
  }
}
