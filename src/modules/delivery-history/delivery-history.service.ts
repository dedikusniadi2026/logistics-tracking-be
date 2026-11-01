import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryHistory } from './entities/delivery-history.entity';
import { CreateDeliveryHistoryDto } from './dto/create-delivery-history.dto';

@Injectable()
export class DeliveryHistoryService {
  constructor(
    @InjectRepository(DeliveryHistory)
    private readonly historyRepository: Repository<DeliveryHistory>,
  ) {}

  async create(createDto: CreateDeliveryHistoryDto) {
    const history = this.historyRepository.create(createDto);
    return this.historyRepository.save(history);
  }

  async findByShipmentId(shipmentId: number) {
    return this.historyRepository.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' },
    });
  }
}
