import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudAlert } from './entities/fraud-alert.entity';
import { Tracking } from '../tracking/entities/tracking.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

interface FraudCheckResult {
  ruleTriggered: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class FraudService {
  // Thresholds
  private readonly MAX_SPEED_KMH = 150;        // >150 km/h = anomaly
  private readonly ROUTE_DEVIATION_KM = 50;    // >50 km dari rute = deviasi
  private readonly RAPID_STATUS_CHANGES = 5;   // >5 status changes dalam 1 jam
  private readonly DUPLICATE_SHIPMENT_MINS = 5; // 2 shipment ke alamat sama dalam 5 menit

  constructor(
    @InjectRepository(FraudAlert)
    private readonly alertRepo: Repository<FraudAlert>,
    @InjectRepository(Tracking)
    private readonly trackingRepo: Repository<Tracking>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private haversine(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async analyzeShipment(shipmentId: number): Promise<FraudAlert[]> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) return [];

    const trackingPoints = await this.trackingRepo.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' },
    });

    const triggers: FraudCheckResult[] = [];

    // Rule 1: Speed anomaly (>150 km/h between consecutive points)
    for (let i = 1; i < trackingPoints.length; i++) {
      const prev = trackingPoints[i - 1];
      const curr = trackingPoints[i];
      const timeDiffHrs =
        (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) /
        (1000 * 60 * 60);

      if (timeDiffHrs > 0) {
        const dist = this.haversine(
          Number(prev.latitude), Number(prev.longitude),
          Number(curr.latitude), Number(curr.longitude),
        );
        const speedKmh = dist / timeDiffHrs;
        if (speedKmh > this.MAX_SPEED_KMH) {
          triggers.push({
            ruleTriggered: 'SPEED_ANOMALY',
            severity: speedKmh > 300 ? 'CRITICAL' : 'HIGH',
            description: `Kecepatan tidak wajar ${Math.round(speedKmh)} km/h terdeteksi antara titik tracking`,
            metadata: { speedKmh: Math.round(speedKmh), threshold: this.MAX_SPEED_KMH },
          });
        }
      }
    }

    // Rule 2: Route deviation from origin→destination straight line
    if (trackingPoints.length > 0 && shipment.destinationLatitude) {
      const directDist = this.haversine(
        Number(shipment.originLatitude), Number(shipment.originLongitude),
        Number(shipment.destinationLatitude), Number(shipment.destinationLongitude),
      );

      let actualDist = 0;
      for (let i = 1; i < trackingPoints.length; i++) {
        actualDist += this.haversine(
          Number(trackingPoints[i - 1].latitude), Number(trackingPoints[i - 1].longitude),
          Number(trackingPoints[i].latitude), Number(trackingPoints[i].longitude),
        );
      }

      const deviation = actualDist - directDist;
      if (deviation > this.ROUTE_DEVIATION_KM) {
        triggers.push({
          ruleTriggered: 'ROUTE_DEVIATION',
          severity: deviation > 100 ? 'HIGH' : 'MEDIUM',
          description: `Deviasi rute ${Math.round(deviation)} km dari rute langsung ${Math.round(directDist)} km`,
          metadata: { deviationKm: Math.round(deviation), directRouteKm: Math.round(directDist) },
        });
      }
    }

    // Rule 3: GPS coordinate jump (teleportation)
    for (let i = 1; i < trackingPoints.length; i++) {
      const dist = this.haversine(
        Number(trackingPoints[i - 1].latitude), Number(trackingPoints[i - 1].longitude),
        Number(trackingPoints[i].latitude), Number(trackingPoints[i].longitude),
      );
      const timeDiffSecs =
        (new Date(trackingPoints[i].timestamp).getTime() -
          new Date(trackingPoints[i - 1].timestamp).getTime()) / 1000;

      // Teleportation: >200km in <60 seconds
      if (dist > 200 && timeDiffSecs < 60) {
        triggers.push({
          ruleTriggered: 'GPS_SPOOFING',
          severity: 'CRITICAL',
          description: `GPS spoofing terdeteksi: perpindahan ${Math.round(dist)} km dalam ${Math.round(timeDiffSecs)} detik`,
          metadata: { distanceKm: Math.round(dist), timeSecs: Math.round(timeDiffSecs) },
        });
      }
    }

    // Rule 4: Shipment still PENDING after 24 hours
    if (shipment.status === 'PENDING') {
      const ageHours =
        (Date.now() - new Date(shipment.createdAt).getTime()) / (1000 * 60 * 60);
      if (ageHours > 24) {
        triggers.push({
          ruleTriggered: 'LONG_PENDING',
          severity: 'LOW',
          description: `Shipment sudah PENDING selama ${Math.round(ageHours)} jam tanpa driver assigned`,
          metadata: { ageHours: Math.round(ageHours) },
        });
      }
    }

    // Save new alerts (avoid duplicates for same rule+shipment within 1 hour)
    const savedAlerts: FraudAlert[] = [];
    for (const trigger of triggers) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existing = await this.alertRepo
        .createQueryBuilder('a')
        .where('a.shipmentId = :sid', { sid: shipmentId })
        .andWhere('a.ruleTriggered = :rule', { rule: trigger.ruleTriggered })
        .andWhere('a.detectedAt > :since', { since: oneHourAgo })
        .getOne();

      if (!existing) {
        const alert = this.alertRepo.create({
          shipmentId,
          ...trigger,
        });
        savedAlerts.push(await this.alertRepo.save(alert));
      }
    }

    return savedAlerts;
  }

  async getAllAlerts(status?: string) {
    const query = this.alertRepo
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.shipment', 'shipment')
      .orderBy('alert.detectedAt', 'DESC');

    if (status) {
      query.where('alert.status = :status', { status });
    }

    return query.getMany();
  }

  async resolveAlert(alertId: number, status: 'RESOLVED' | 'FALSE_POSITIVE' | 'INVESTIGATED') {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) return null;
    alert.status = status;
    return this.alertRepo.save(alert);
  }

  async getFraudSummary() {
    const [total, open, critical, high] = await Promise.all([
      this.alertRepo.count(),
      this.alertRepo.count({ where: { status: 'OPEN' } }),
      this.alertRepo.count({ where: { status: 'OPEN', severity: 'CRITICAL' } }),
      this.alertRepo.count({ where: { status: 'OPEN', severity: 'HIGH' } }),
    ]);

    const byRule = await this.alertRepo
      .createQueryBuilder('a')
      .select('a.ruleTriggered', 'rule')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.status = :status', { status: 'OPEN' })
      .groupBy('a.ruleTriggered')
      .getRawMany<{ rule: string; count: string }>();

    return {
      total,
      open,
      critical,
      high,
      byRule: byRule.map((r) => ({ rule: r.rule, count: Number(r.count) })),
    };
  }
}
