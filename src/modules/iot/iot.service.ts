import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotDevice } from './entities/iot-device.entity';
import { IotTelemetryDto, RegisterIotDeviceDto } from './dto/iot-telemetry.dto';
import { Tracking } from '../tracking/entities/tracking.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Server } from 'socket.io';

@Injectable()
export class IotService {
  private io?: Server;

  constructor(
    @InjectRepository(IotDevice)
    private readonly deviceRepo: Repository<IotDevice>,
    @InjectRepository(Tracking)
    private readonly trackingRepo: Repository<Tracking>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  setIoServer(io: Server) {
    this.io = io;
  }

  async registerDevice(dto: RegisterIotDeviceDto) {
    const existing = await this.deviceRepo.findOne({ where: { deviceId: dto.deviceId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.deviceRepo.save(existing);
    }
    const device = this.deviceRepo.create({
      ...dto,
      reportIntervalSecs: dto.reportIntervalSecs ?? 30,
    });
    return this.deviceRepo.save(device);
  }

  async processTelemetry(dto: IotTelemetryDto) {
    // Find device
    const device = await this.deviceRepo.findOne({ where: { deviceId: dto.deviceId } });
    if (!device) {
      throw new NotFoundException(`Device ${dto.deviceId} tidak terdaftar. Daftarkan dulu via POST /iot/devices`);
    }

    if (device.status === 'INACTIVE') {
      throw new BadRequestException(`Device ${dto.deviceId} tidak aktif`);
    }

    // Update device last seen
    device.lastLatitude = dto.latitude;
    device.lastLongitude = dto.longitude;
    device.lastSeenAt = new Date();
    if (dto.batteryLevel !== undefined) device.batteryLevel = dto.batteryLevel;
    if (dto.signalStrength !== undefined) device.signalStrength = dto.signalStrength;
    await this.deviceRepo.save(device);

    // Find active shipment linked to this vehicle/driver
    let shipment: Shipment | null = null;
    if (device.vehicleId) {
      shipment = await this.shipmentRepo.findOne({
        where: {
          vehicleId: device.vehicleId,
          status: 'IN_TRANSIT',
        },
        order: { createdAt: 'DESC' },
      });
    }
    if (!shipment && device.driverId) {
      shipment = await this.shipmentRepo.findOne({
        where: {
          driverId: device.driverId,
          status: 'IN_TRANSIT',
        },
        order: { createdAt: 'DESC' },
      });
    }

    // Save tracking point if there's an active shipment
    let trackingPoint: Tracking | null = null;
    if (shipment) {
      trackingPoint = this.trackingRepo.create({
        shipmentId: shipment.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speed: dto.speed,
        heading: dto.heading,
        status: shipment.status,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      });
      trackingPoint = await this.trackingRepo.save(trackingPoint);

      // Broadcast via WebSocket
      this.io?.to(`shipment:${shipment.id}`).emit('tracking:point', {
        ...trackingPoint,
        source: 'IOT',
        deviceId: dto.deviceId,
        batteryLevel: dto.batteryLevel,
        signalStrength: dto.signalStrength,
      });

      // Broadcast IoT fleet update
      this.io?.emit('iot:fleet', {
        deviceId: dto.deviceId,
        vehicleId: device.vehicleId,
        driverId: device.driverId,
        shipmentId: shipment.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speed: dto.speed,
        heading: dto.heading,
        batteryLevel: dto.batteryLevel,
        timestamp: trackingPoint.timestamp,
      });
    }

    return {
      deviceId: dto.deviceId,
      received: true,
      activeShipment: shipment
        ? { id: shipment.id, shipmentNumber: shipment.shipmentNumber }
        : null,
      trackingPointSaved: !!trackingPoint,
      batteryLevel: dto.batteryLevel,
      timestamp: new Date().toISOString(),
    };
  }

  async getAllDevices() {
    return this.deviceRepo.find({ order: { lastSeenAt: 'DESC' } });
  }

  async getDevice(deviceId: string) {
    const device = await this.deviceRepo.findOne({ where: { deviceId } });
    if (!device) throw new NotFoundException(`Device ${deviceId} tidak ditemukan`);
    return device;
  }

  async getFleetStatus() {
    const devices = await this.deviceRepo.find({ where: { status: 'ACTIVE' } });

    const now = new Date();
    return devices.map((d) => {
      const lastSeen = d.lastSeenAt ? new Date(d.lastSeenAt) : null;
      const secondsSinceUpdate = lastSeen
        ? (now.getTime() - lastSeen.getTime()) / 1000
        : null;
      const isOnline =
        secondsSinceUpdate !== null && secondsSinceUpdate <= d.reportIntervalSecs * 3;

      return {
        deviceId: d.deviceId,
        vehicleId: d.vehicleId,
        driverId: d.driverId,
        isOnline,
        lastLatitude: d.lastLatitude,
        lastLongitude: d.lastLongitude,
        batteryLevel: d.batteryLevel,
        signalStrength: d.signalStrength,
        secondsSinceLastUpdate: secondsSinceUpdate ? Math.round(secondsSinceUpdate) : null,
        lastSeenAt: d.lastSeenAt,
      };
    });
  }

  async updateDeviceStatus(deviceId: string, status: string) {
    const device = await this.getDevice(deviceId);
    device.status = status;
    return this.deviceRepo.save(device);
  }
}
