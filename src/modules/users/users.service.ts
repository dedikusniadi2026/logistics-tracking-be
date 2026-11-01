import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'P@ssw0rd';
    const userExist = await this.findByEmail(adminEmail);
    if (!userExist) {
      const hashPassword = await bcrypt.hash(adminPassword, 10);
      await this.create({
        name: 'Admin',
        email: adminEmail,
        password: hashPassword,
        phone: '081234567890',
        role: 'ADMIN',
        isActive: true,
      });
      console.log('Seeded default admin user: admin@gmail.com');
    }
  }

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);

    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findById(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, data: Partial<User>) {
    await this.userRepository.update(id, data);

    return this.findById(id);
  }

  async delete(id: number) {
    return this.userRepository.delete(id);
  }
}
