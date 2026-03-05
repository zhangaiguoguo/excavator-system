import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByOpenId(wxOpenid: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ wxOpenid });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.usersRepository.findOneBy({ id });
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<any> {
    // In a real application, you should hash the password and compare the hash
    // This is a simplified example
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Warning: Plain text password comparison for demo only. Use bcrypt in production.
    if (user.password !== oldPassword) {
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = newPassword;
    await this.usersRepository.save(user);
    
    return { message: 'Password updated successfully' };
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
