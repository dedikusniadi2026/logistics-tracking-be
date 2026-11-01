import { Injectable,Inject ,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { DeliveryHistory } from '../delivery-history/entities/delivery-history.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,

    @InjectRepository(DeliveryHistory)
    private readonly historyRepository: Repository<DeliveryHistory>,

    @Inject('RABBIT_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    // Generate unique shipment number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const shipmentNumber = `SHP-${dateStr}-${randomSuffix}`;

    const status = createShipmentDto.driverId ? 'ASSIGNED' : 'PENDING';

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      shipmentNumber,
      status,
    });

    const savedShipment = await this.shipmentRepository.save(shipment);

    console.log('Shipment saved', savedShipment.id);


    this.rabbitClient.emit('shipment.created', {
      shipmentId: savedShipment.id,
      shipmentNumber: savedShipment.shipmentNumber,
      customerId: savedShipment.customerId,
      status: savedShipment.status,
    });

    const history = this.historyRepository.create({
      shipmentId: savedShipment.id,
      status,
      description:
        status === 'ASSIGNED'
          ? 'Shipment created and driver assigned.'
          : 'Shipment created and pending driver assignment.',
    });

    console.log('History created');

    await this.historyRepository.save(history);

    console.log('History saved');    

    return this.findOne(savedShipment.id);
  }

  async findAll() {
    return this.shipmentRepository.find({
      relations: {
        customer: true,
        driver: true,
        vehicle: true,
      },
    });
  }

  async findOne(id: number) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        driver: true,
        vehicle: true,
        trackings: true,
        histories: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  async update(id: number, updateShipmentDto: UpdateShipmentDto) {
    const shipment = await this.findOne(id);

    const oldStatus = shipment.status;
    const newStatus = updateShipmentDto.status || oldStatus;

    Object.assign(shipment, updateShipmentDto);

    if (newStatus === 'DELIVERED' && oldStatus !== 'DELIVERED') {
      shipment.actualDelivery = new Date();
    }

    await this.shipmentRepository.save(shipment);

    if (newStatus !== oldStatus) {
      this.rabbitClient.emit('shipment.status.changed', {
        shipmentId: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        oldStatus,
        newStatus,
      });
    }

    if (newStatus !== oldStatus) {
      const history = this.historyRepository.create({
        shipmentId: id,
        status: newStatus,
        description: `Shipment status updated from ${oldStatus} to ${newStatus}.`,
      });
      await this.historyRepository.save(history);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const shipment = await this.findOne(id);
    return this.shipmentRepository.remove(shipment);
  }
}
