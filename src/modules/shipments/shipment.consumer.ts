import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Injectable()
export class ShipmentConsumer {
  private readonly logger = new Logger(ShipmentConsumer.name);

  @EventPattern('shipment.created')
  handleShipmentCreated(@Payload() data: unknown) {
    this.logger.log(`[RabbitMQ] ✅ shipment.created: ${JSON.stringify(data)}`);
  }

  @EventPattern('shipment.status.changed')
  handleStatusChanged(@Payload() data: unknown) {
    this.logger.log(`[RabbitMQ] ✅ shipment.status.changed: ${JSON.stringify(data)}`);
  }
}