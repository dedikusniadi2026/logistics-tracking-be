import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotDevice } from './entities/iot-device.entity';
import { Tracking } from '../tracking/entities/tracking.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { IotService } from './iot.service';
import { IotController } from './iot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IotDevice, Tracking, Shipment])],
  controllers: [IotController],
  providers: [IotService],
  exports: [IotService],
})
export class IotModule {}
