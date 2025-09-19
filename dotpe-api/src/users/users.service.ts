import { Injectable } from '@nestjs/common';

export type User = { id: string; phone: string };

@Injectable()
export class UsersService {
  private users = new Map<string, User>(); // key: phone

  findOrCreateByPhone(phone: string): User {
    const existing = this.users.get(phone);
    if (existing) return existing;
    const user: User = { id: `${Date.now()}`, phone };
    this.users.set(phone, user);
    return user;
  }
}
