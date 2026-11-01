import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { DeliveryHistory } from '../delivery-history/entities/delivery-history.entity';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { ShipmentConsumer } from './shipment.consumer';
import { RabbitModule } from '../rabitmq/rabitmq_module';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, DeliveryHistory]), RabbitModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentConsumer],
  exports: [ShipmentsService, TypeOrmModule],
})
export class ShipmentsModule {}
