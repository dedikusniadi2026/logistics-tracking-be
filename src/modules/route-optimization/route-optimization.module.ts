import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../drivers/entities/driver.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { DeliveryHistory } from '../delivery-history/entities/delivery-history.entity';
import { RouteOptimizationService } from './route-optimization.service';
import { RouteOptimizationController } from './route-optimization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Shipment, DeliveryHistory])],
  controllers: [RouteOptimizationController],
  providers: [RouteOptimizationService],
  exports: [RouteOptimizationService],
})
export class RouteOptimizationModule {}
