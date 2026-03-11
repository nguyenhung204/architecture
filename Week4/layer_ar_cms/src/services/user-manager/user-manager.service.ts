import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';
import { IUser } from '../../common/interfaces/user.interface';
import { CreateUserDto } from '../../common/dto/create-user.dto';

@Injectable()
export class UserManagerService {
  constructor(private readonly userRepo: UserRepository) {}

  findAll(): IUser[] {
    return this.userRepo.findAll();
  }

  findById(id: string): IUser | undefined {
    return this.userRepo.findById(id);
  }

  create(dto: CreateUserDto): IUser {
    return this.userRepo.create(dto);
  }

  delete(id: string): boolean {
    return this.userRepo.delete(id);
  }
}
