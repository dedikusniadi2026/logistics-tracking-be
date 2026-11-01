import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Tracking } from './entities/tracking.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { DeliveryHistory } from '../delivery-history/entities/delivery-history.entity';
import { CreateTrackingDto } from './dto/create-tracking.dto';

@Injectable()
export class TrackingService {
  private io?: Server;

  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,

    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,

    @InjectRepository(DeliveryHistory)
    private readonly historyRepository: Repository<DeliveryHistory>,
  ) {}

  // Called by gateway after init
  setIoServer(io: Server) {
    this.io = io;
  }

  async create(createTrackingDto: CreateTrackingDto) {
    const {
      shipmentId,
      latitude,
      longitude,
      status,
      speed,
      heading,
      timestamp,
    } = createTrackingDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found`);
    }

    const currentStatus = status || shipment.status;

    const trackingTimestamp = timestamp ? new Date(timestamp) : new Date();

    // Create tracking point
    const tracking = this.trackingRepository.create({
      shipmentId,
      latitude,
      longitude,
      speed,
      heading,
      status: currentStatus,
      timestamp: trackingTimestamp,
    });
    const savedTracking = await this.trackingRepository.save(tracking);

    // Emit realtime update
    this.io?.to(`shipment:${shipmentId}`).emit('tracking:point', {
      ...savedTracking,
    });

    // Update shipment status if changed, and log history
    if (status && status !== shipment.status) {
      shipment.status = status;
      if (status === 'DELIVERED') {
        shipment.actualDelivery = new Date();
      }
      await this.shipmentRepository.save(shipment);

      const history = this.historyRepository.create({
        shipmentId,
        status,
        description: `Shipment status updated via GPS tracking to ${status}. Coordinates: ${latitude}, ${longitude}`,
      });
      await this.historyRepository.save(history);
    }

    return savedTracking;
  }

  async findByShipmentId(shipmentId: number) {
    const trackingLogs = await this.trackingRepository.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' },
    });
    return trackingLogs;
  }

  // Default shape: { shipmentId, latest }
  async getLive(shipmentId: number) {
    const latest = await this.trackingRepository.findOne({
      where: { shipmentId },
      order: { timestamp: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException(
        `No tracking points for shipment ${shipmentId}`,
      );
    }

    return {
      shipmentId,
      latest,
    };
  }

  // Return latest tracking point for all shipments (array)
  // Each item: { shipmentId, latest }
  async getLiveAll() {
    const latestPerShipment = await this.trackingRepository
      .createQueryBuilder('tracking')
      .select('tracking.shipmentId', 'shipmentId')
      .addSelect('MAX(tracking.timestamp)', 'latestTimestamp')
      .groupBy('tracking.shipmentId')
      .getRawMany<{ shipmentId: number; latestTimestamp: Date }>();

    if (!latestPerShipment.length) return [];

    const shipmentIds = latestPerShipment.map((x) => Number(x.shipmentId));

    const latestRows = await this.trackingRepository
      .createQueryBuilder('t')
      .where('t.shipmentId IN (:...shipmentIds)', { shipmentIds })
      .orderBy('t.shipmentId', 'ASC')
      .addOrderBy('t.timestamp', 'DESC')
      .getMany();

    // Map: shipmentId -> latest row
    const latestMap = new Map<number, (typeof latestRows)[number]>();
    for (const row of latestRows) {
      if (!latestMap.has(row.shipmentId)) {
        latestMap.set(row.shipmentId, row);
      }
    }

    return latestPerShipment
      .map((x) => {
        const shipmentId = Number(x.shipmentId);
        return {
          shipmentId,
          latest: latestMap.get(shipmentId) ?? null,
        };
      })
      .filter((item) => item.latest);
  }

  // Default shape: GeoJSON LineString
  // { type:'Feature', geometry:{type:'LineString',coordinates:[[lng,lat],...]}, properties:{shipmentId} }
  async getRoute(shipmentId: number) {
    const trackingLogs = await this.trackingRepository.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' },
    });

    if (!trackingLogs.length) {
      throw new NotFoundException(
        `No tracking route for shipment ${shipmentId}`,
      );
    }

    const coordinates = trackingLogs.map((p) => [
      Number(p.longitude),
      Number(p.latitude),
    ]);

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
      properties: {
        shipmentId,
        points: trackingLogs.length,
      },
    };
  }
}
