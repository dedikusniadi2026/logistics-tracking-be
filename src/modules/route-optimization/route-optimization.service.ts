import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AutoDispatchDto, CoordinateDto, OptimizeRouteDto } from './dto/optimize-route.dto';
import { Driver } from '../drivers/entities/driver.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { DeliveryHistory } from '../delivery-history/entities/delivery-history.entity';

interface WaypointResult {
  order: number;
  label?: string;
  latitude: number;
  longitude: number;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
}

@Injectable()
export class RouteOptimizationService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(DeliveryHistory)
    private readonly historyRepo: Repository<DeliveryHistory>,
  ) {}

  // ── Haversine distance (km) ──────────────────────────────────
  private haversine(a: CoordinateDto, b: CoordinateDto): number {
    const R = 6371;
    const dLat = this.toRad(b.latitude - a.latitude);
    const dLng = this.toRad(b.longitude - a.longitude);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const c =
      sinLat * sinLat +
      Math.cos(this.toRad(a.latitude)) * Math.cos(this.toRad(b.latitude)) * sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  }

  private toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  // ── Nearest Neighbor TSP Heuristic ──────────────────────────
  private nearestNeighborTSP(origin: CoordinateDto, destinations: CoordinateDto[]) {
    const unvisited = [...destinations.map((d, i) => ({ ...d, originalIndex: i }))];
    const route: typeof unvisited = [];
    let current: CoordinateDto = origin;

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      unvisited.forEach((dest, i) => {
        const dist = this.haversine(current, dest);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      });

      route.push(unvisited[nearestIdx]);
      current = unvisited[nearestIdx];
      unvisited.splice(nearestIdx, 1);
    }

    return route;
  }

  // ── AI Route Optimization ──────────────────────────────────
  async optimizeRoute(dto: OptimizeRouteDto) {
    if (!dto.destinations?.length) {
      throw new BadRequestException('Minimal 1 tujuan diperlukan');
    }

    const optimized = this.nearestNeighborTSP(dto.origin, dto.destinations);

    let totalDistance = 0;
    let totalDuration = 0;
    const avgSpeedKmh = dto.optimizeFor === 'time' ? 60 : 45;

    const waypoints: WaypointResult[] = [];
    let prev: CoordinateDto = dto.origin;

    optimized.forEach((dest, idx) => {
      const dist = this.haversine(prev, dest);
      const dur = (dist / avgSpeedKmh) * 60;
      totalDistance += dist;
      totalDuration += dur;

      waypoints.push({
        order: idx + 1,
        label: dest.label,
        latitude: dest.latitude,
        longitude: dest.longitude,
        estimatedDistanceKm: Math.round(dist * 100) / 100,
        estimatedDurationMin: Math.round(dur),
      });
      prev = dest;
    });

    // Return-to-origin distance
    const returnDist = this.haversine(prev, dto.origin);
    totalDistance += returnDist;

    const savingsPercent = this.estimateSavings(dto.destinations, waypoints);

    return {
      algorithm: 'Nearest Neighbor TSP Heuristic (AI-optimized)',
      optimizeFor: dto.optimizeFor ?? 'distance',
      origin: dto.origin,
      waypoints,
      summary: {
        totalStops: waypoints.length,
        totalDistanceKm: Math.round(totalDistance * 100) / 100,
        totalDurationMin: Math.round(totalDuration),
        estimatedFuelLiters: Math.round((totalDistance / 10) * 100) / 100, // ~10km/L
        savingsPercent,
      },
      returnToOriginKm: Math.round(returnDist * 100) / 100,
      generatedAt: new Date().toISOString(),
    };
  }

  private estimateSavings(
    original: CoordinateDto[],
    optimized: WaypointResult[],
  ): number {
    // Naive comparison: sum of sequential distances vs optimized
    let origDist = 0;
    for (let i = 0; i < original.length - 1; i++) {
      origDist += this.haversine(original[i], original[i + 1]);
    }
    const optDist = optimized.reduce((s, w) => s + w.estimatedDistanceKm, 0);
    if (origDist <= 0) return 0;
    return Math.max(0, Math.round(((origDist - optDist) / origDist) * 10000) / 100);
  }

  // ── Auto Dispatch System ────────────────────────────────────
  async autoDispatch(dto: AutoDispatchDto) {
    const strategy = dto.strategy ?? 'nearest';

    // Get pending shipments
    const shipments = await this.shipmentRepo.find({
      where: { id: In(dto.shipmentIds), status: 'PENDING' },
    });

    if (!shipments.length) {
      throw new BadRequestException('Tidak ada shipment PENDING yang dapat di-dispatch');
    }

    // Get available drivers
    const availableDrivers = await this.driverRepo.find({
      where: { status: 'AVAILABLE' },
    });

    if (!availableDrivers.length) {
      throw new BadRequestException('Tidak ada driver yang tersedia saat ini');
    }

    const dispatched: Array<{
      shipmentId: number;
      shipmentNumber: string;
      driverId: number;
      driverName: string;
      reason: string;
    }> = [];

    const driverLoadMap = new Map<number, number>();
    availableDrivers.forEach((d) => driverLoadMap.set(d.id, 0));

    for (const shipment of shipments) {
      let selectedDriver: Driver | null = null;

      if (strategy === 'nearest') {
        // Pick driver with least load (simple heuristic - in real system would use GPS)
        let minLoad = Infinity;
        for (const driver of availableDrivers) {
          const load = driverLoadMap.get(driver.id) ?? 0;
          if (load < minLoad) {
            minLoad = load;
            selectedDriver = driver;
          }
        }
      } else if (strategy === 'balanced') {
        // Round-robin assignment
        const idx = dispatched.length % availableDrivers.length;
        selectedDriver = availableDrivers[idx];
      } else {
        // priority: first available
        selectedDriver = availableDrivers[0];
      }

      if (!selectedDriver) continue;

      shipment.driverId = selectedDriver.id;
      shipment.status = 'ASSIGNED';
      await this.shipmentRepo.save(shipment);

      await this.historyRepo.save(
        this.historyRepo.create({
          shipmentId: shipment.id,
          status: 'ASSIGNED',
          description: `Auto-dispatch: Driver ${selectedDriver.name} ditugaskan via strategi ${strategy}`,
        }),
      );

      driverLoadMap.set(selectedDriver.id, (driverLoadMap.get(selectedDriver.id) ?? 0) + 1);

      dispatched.push({
        shipmentId: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        reason: `Assigned via ${strategy} strategy`,
      });
    }

    return {
      strategy,
      totalDispatched: dispatched.length,
      dispatched,
      skipped: dto.shipmentIds.length - dispatched.length,
    };
  }
}
