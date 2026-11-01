import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryHistoryService } from './delivery-history.service';
import { CreateDeliveryHistoryDto } from './dto/create-delivery-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Delivery History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-history')
export class DeliveryHistoryController {
  constructor(private readonly historyService: DeliveryHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a manual status history entry for a shipment' })
  create(@Body() createDto: CreateDeliveryHistoryDto) {
    return this.historyService.create(createDto);
  }

  @Get('shipment/:shipmentId')
  @ApiOperation({
    summary: 'Get status transition logs of a specific shipment',
  })
  findByShipmentId(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.historyService.findByShipmentId(shipmentId);
  }
}
