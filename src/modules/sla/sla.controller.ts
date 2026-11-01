import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SlaService } from './sla.service';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';

@ApiTags('SLA Monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Post('policies')
  @ApiOperation({ summary: 'Buat SLA policy baru' })
  createPolicy(@Body() dto: CreateSlaPolicyDto) {
    return this.slaService.createPolicy(dto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Daftar semua SLA policy' })
  findPolicies() {
    return this.slaService.findAllPolicies();
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard SLA monitoring semua shipment aktif',
    description: 'Menampilkan status ON_TIME / WARNING / BREACHED untuk semua shipment yang belum terdeliver',
  })
  @ApiQuery({ name: 'policyId', required: false, type: Number })
  async dashboard(@Query('policyId') policyId?: string): Promise<Record<string, unknown>> {
    return this.slaService.getSlaDashboard(policyId ? Number(policyId) : undefined);
  }

  @Get('shipments/:shipmentId')
  @ApiOperation({ summary: 'Status SLA untuk shipment tertentu' })
  shipmentSla(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.slaService.getShipmentSlaStatus(shipmentId);
  }
}
