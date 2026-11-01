import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,

    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getStats() {
    const [totalShipments, totalDrivers, totalVehicles, totalCustomers] =
      await Promise.all([
        this.shipmentRepository.count(),
        this.driverRepository.count(),
        this.vehicleRepository.count(),
        this.customerRepository.count(),
      ]);

    // Group shipments by status
    const statusCounts = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('shipment.status', 'status')
      .addSelect('COUNT(shipment.id)', 'count')
      .groupBy('shipment.status')
      .getRawMany();

    const shipmentStatusBreakdown = {
      PENDING: 0,
      ASSIGNED: 0,
      PICKED_UP: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach((item: { status: string; count: string | number }) => {
      if (item.status in shipmentStatusBreakdown) {
        shipmentStatusBreakdown[
          item.status as keyof typeof shipmentStatusBreakdown
        ] = Number(item.count);
      }
    });

    // Get 5 recent shipments
    const recentShipments = await this.shipmentRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: {
        customer: true,
        driver: true,
      },
    });

    return {
      totals: {
        shipments: totalShipments,
        drivers: totalDrivers,
        vehicles: totalVehicles,
        customers: totalCustomers,
      },
      shipmentStatusBreakdown,
      recentShipments,
    };
  }
}
