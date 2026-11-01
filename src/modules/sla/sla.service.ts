import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';

type SlaStatus = 'ON_TIME' | 'WARNING' | 'BREACHED' | 'DELIVERED_ON_TIME' | 'DELIVERED_LATE';

export interface SlaShipmentResult {
  shipmentId: number;
  shipmentNumber: string;
  createdAt: Date;
  status: string;
  slaStatus: SlaStatus;
  elapsedHours: number;
  remainingHours: number;
  slaMaxHours: number;
  percentElapsed: number;
  estimatedDelivery: Date | undefined;
  actualDelivery: Date | undefined;
}

@Injectable()
export class SlaService {
  constructor(
    @InjectRepository(SlaPolicy)
    private readonly slaPolicyRepo: Repository<SlaPolicy>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  // ── SLA Policy CRUD ──────────────────────────────────────────
  async createPolicy(dto: CreateSlaPolicyDto) {
    const policy = this.slaPolicyRepo.create({
      ...dto,
      warningThresholdPercent: dto.warningThresholdPercent ?? 80,
    });
    return this.slaPolicyRepo.save(policy);
  }

  async findAllPolicies() {
    return this.slaPolicyRepo.find();
  }

  async findOnePolicy(id: number) {
    const p = await this.slaPolicyRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`SLA Policy ${id} not found`);
    return p;
  }

  // ── SLA Monitoring ───────────────────────────────────────────
  async getSlaDashboard(slaPolicyId?: number) {
    // Get default/active SLA policy
    let policy: SlaPolicy | null = null;
    if (slaPolicyId) {
      policy = await this.findOnePolicy(slaPolicyId);
    } else {
      policy = await this.slaPolicyRepo.findOne({
        where: { status: 'ACTIVE' },
        order: { createdAt: 'ASC' },
      });
    }

    const slaHours = policy?.maxDeliveryHours ?? 48; // default 48 jam
    const warningThreshold = policy?.warningThresholdPercent ?? 80;

    const activeShipments = await this.shipmentRepo.find({
      where: {
        status: Not(In(['DELIVERED', 'CANCELLED'])),
      },
    });

    const now = new Date();
    const results: SlaShipmentResult[] = activeShipments.map((s) => {
      const elapsedMs = now.getTime() - new Date(s.createdAt).getTime();
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      const remainingHours = Math.max(0, slaHours - elapsedHours);
      const percentElapsed = Math.min(100, (elapsedHours / slaHours) * 100);

      let slaStatus: SlaStatus;
      if (s.actualDelivery) {
        const deliveredHours =
          (new Date(s.actualDelivery).getTime() - new Date(s.createdAt).getTime()) /
          (1000 * 60 * 60);
        slaStatus = deliveredHours <= slaHours ? 'DELIVERED_ON_TIME' : 'DELIVERED_LATE';
      } else if (elapsedHours > slaHours) {
        slaStatus = 'BREACHED';
      } else if (percentElapsed >= warningThreshold) {
        slaStatus = 'WARNING';
      } else {
        slaStatus = 'ON_TIME';
      }

      return {
        shipmentId: s.id,
        shipmentNumber: s.shipmentNumber,
        createdAt: s.createdAt,
        status: s.status,
        slaStatus,
        elapsedHours: Math.round(elapsedHours * 100) / 100,
        remainingHours: Math.round(remainingHours * 100) / 100,
        slaMaxHours: slaHours,
        percentElapsed: Math.round(percentElapsed * 100) / 100,
        estimatedDelivery: s.estimatedDelivery,
        actualDelivery: s.actualDelivery,
      };
    });

    const breached = results.filter((r) => r.slaStatus === 'BREACHED');
    const warning = results.filter((r) => r.slaStatus === 'WARNING');
    const onTime = results.filter((r) => r.slaStatus === 'ON_TIME');

    return {
      policy: policy
        ? { id: policy.id, name: policy.name, maxDeliveryHours: slaHours }
        : { id: null, name: 'Default', maxDeliveryHours: slaHours },
      summary: {
        total: results.length,
        breached: breached.length,
        warning: warning.length,
        onTime: onTime.length,
        breachRate:
          results.length > 0
            ? Math.round((breached.length / results.length) * 10000) / 100
            : 0,
      },
      breached,
      warning,
      onTime,
      generatedAt: now.toISOString(),
    };
  }

  async getShipmentSlaStatus(shipmentId: number) {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);

    const policy = await this.slaPolicyRepo.findOne({ where: { status: 'ACTIVE' } });
    const slaHours = policy?.maxDeliveryHours ?? 48;
    const warningThreshold = policy?.warningThresholdPercent ?? 80;

    const now = new Date();
    const elapsedMs = now.getTime() - new Date(shipment.createdAt).getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const percentElapsed = Math.min(100, (elapsedHours / slaHours) * 100);
    const remainingHours = Math.max(0, slaHours - elapsedHours);

    let slaStatus: SlaStatus;
    if (shipment.actualDelivery) {
      const deliveredHours =
        (new Date(shipment.actualDelivery).getTime() - new Date(shipment.createdAt).getTime()) /
        (1000 * 60 * 60);
      slaStatus = deliveredHours <= slaHours ? 'DELIVERED_ON_TIME' : 'DELIVERED_LATE';
    } else if (elapsedHours > slaHours) {
      slaStatus = 'BREACHED';
    } else if (percentElapsed >= warningThreshold) {
      slaStatus = 'WARNING';
    } else {
      slaStatus = 'ON_TIME';
    }

    return {
      shipmentId,
      shipmentNumber: shipment.shipmentNumber,
      slaStatus,
      elapsedHours: Math.round(elapsedHours * 100) / 100,
      remainingHours: Math.round(remainingHours * 100) / 100,
      percentElapsed: Math.round(percentElapsed * 100) / 100,
      slaMaxHours: slaHours,
    };
  }
}
