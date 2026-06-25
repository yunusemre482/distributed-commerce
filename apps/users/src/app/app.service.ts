import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDTO } from '@libs/shared/src/dtos/users/create-user.dto';

@Injectable()
export class AppService {

  constructor(
    private readonly userRepository: UserRepository,
  ) { }


  getUsers() {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: ''
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: ''
      }
    ];

  }

  async createUser(user: CreateUserDTO) {
    return this.userRepository.createUser(user);
  }

  async findAllUsers() {
    return this.userRepository.findAllUsers();
  }

}
