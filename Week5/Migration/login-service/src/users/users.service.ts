import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Called by SyncController when register-service emits user_created
  async syncUser(email: string, hashedPassword: string, name?: string): Promise<void> {
    const existing = await this.findByEmail(email);
    if (existing) return; // idempotent — skip if already synced
    await new this.userModel({ email, password: hashedPassword, name }).save();
  }
}
