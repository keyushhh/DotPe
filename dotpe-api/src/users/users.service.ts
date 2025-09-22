import { Injectable } from '@nestjs/common';

// Temporary in-memory user store (later can move to DB like Postgres)
type User = {
  id: number;
  phone: string;
};

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  async findByPhone(phone: string): Promise<User | undefined> {
    return this.users.find((u) => u.phone === phone);
  }

  async create(data: { phone: string }): Promise<User> {
    const newUser: User = {
      id: this.idCounter++,
      phone: data.phone,
    };
    this.users.push(newUser);
    return newUser;
  }
}
