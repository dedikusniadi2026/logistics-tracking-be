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
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  @ApiOperation({ summary: 'Log current location coordinates for a shipment' })
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingService.create(createTrackingDto);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get latest tracking point for all shipments' })
  getLiveAll() {
    return this.trackingService.getLiveAll();
  }

  @Get('live/shipment/:shipmentId')
  @ApiOperation({
    summary: 'Get latest tracking point for a shipment',
  })
  getLive(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.trackingService.getLive(shipmentId);
  }

  @Get('route/shipment/:shipmentId')
  @ApiOperation({
    summary: 'Get shipment route as GeoJSON LineString from tracking logs',
  })
  getRoute(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.trackingService.getRoute(shipmentId);
  }

  @Get('route/:shipmentId')
  @ApiOperation({
    summary:
      'Alias: get shipment route as GeoJSON LineString from tracking logs',
  })
  getRouteById(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.trackingService.getRoute(shipmentId);
  }

  @Get('shipment/:shipmentId')
  @ApiOperation({
    summary: 'Get all coordinates logged for a specific shipment',
  })
  findByShipmentId(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.trackingService.findByShipmentId(shipmentId);
  }
}
