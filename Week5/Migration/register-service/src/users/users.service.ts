import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, hashedPassword: string, name?: string): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) throw new ConflictException('Email already registered');
    return new this.userModel({ email, password: hashedPassword, name }).save();
  }
}
