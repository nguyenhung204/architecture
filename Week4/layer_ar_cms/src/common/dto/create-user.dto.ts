export class CreateUserDto {
  username: string;
  email: string;
  role?: 'admin' | 'editor' | 'viewer';
}
