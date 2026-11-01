import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryHistory } from './entities/delivery-history.entity';
import { DeliveryHistoryService } from './delivery-history.service';
import { DeliveryHistoryController } from './delivery-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryHistory])],
  controllers: [DeliveryHistoryController],
  providers: [DeliveryHistoryService],
  exports: [DeliveryHistoryService, TypeOrmModule],
})
export class DeliveryHistoryModule {}
