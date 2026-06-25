import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async createUser(user: Partial<User>): Promise<User> {
    const newUser = this._userRepository.create(user);
    return this._userRepository.save(newUser);
  }

  async findUser(filter: Partial<User>): Promise<User | null> {
    return this._userRepository.findOne({ where: filter });
  }

  async findAllUsers(): Promise<User[]> {
    return this._userRepository.find();
  }

  async findUserById(id: string): Promise<User | null> {
    return this._userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: string) {
    return this._userRepository.delete(id);
  }
}
