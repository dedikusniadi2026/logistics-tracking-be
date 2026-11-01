import { Controller, Get, Post, Param, Query, ParseIntPipe, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FraudService } from './fraud.service';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveAlertDto {
  @ApiProperty({ enum: ['RESOLVED', 'FALSE_POSITIVE', 'INVESTIGATED'] })
  @IsEnum(['RESOLVED', 'FALSE_POSITIVE', 'INVESTIGATED'])
  status!: 'RESOLVED' | 'FALSE_POSITIVE' | 'INVESTIGATED';
}

@ApiTags('Fraud Detection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Post('analyze/:shipmentId')
  @ApiOperation({
    summary: 'Analisis fraud untuk satu shipment',
    description: 'Menjalankan semua rule: speed anomaly, route deviation, GPS spoofing, long pending',
  })
  analyze(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.fraudService.analyzeShipment(shipmentId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Semua fraud alerts' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'INVESTIGATED', 'RESOLVED', 'FALSE_POSITIVE'] })
  getAlerts(@Query('status') status?: string) {
    return this.fraudService.getAllAlerts(status);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan fraud detection' })
  getSummary() {
    return this.fraudService.getFraudSummary();
  }

  @Post('alerts/:alertId/resolve')
  @ApiOperation({ summary: 'Update status fraud alert' })
  resolve(
    @Param('alertId', ParseIntPipe) alertId: number,
    @Body() dto: ResolveAlertDto,
  ) {
    return this.fraudService.resolveAlert(alertId, dto.status);
  }
}
