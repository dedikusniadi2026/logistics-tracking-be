import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async create(createDriverDto: CreateDriverDto) {
    const driver = this.driverRepository.create(createDriverDto);
    return this.driverRepository.save(driver);
  }

  async findAll() {
    return this.driverRepository.find();
  }

  async findOne(id: number) {
    return this.driverRepository.findOne({ where: { id } });
  }

  async update(id: number, updateDriverDto: UpdateDriverDto) {
    await this.driverRepository.update(id, updateDriverDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.driverRepository.delete(id);
  }
}
