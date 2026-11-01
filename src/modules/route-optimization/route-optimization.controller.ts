import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RouteOptimizationService } from './route-optimization.service';
import { AutoDispatchDto, OptimizeRouteDto } from './dto/optimize-route.dto';

@ApiTags('AI Route Optimization & Auto Dispatch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('route-optimization')
export class RouteOptimizationController {
  constructor(private readonly service: RouteOptimizationService) {}

  @Post('optimize')
  @ApiOperation({
    summary: 'Optimasi rute pengiriman dengan AI (Nearest Neighbor TSP)',
    description:
      'Menghitung urutan optimal pengiriman ke beberapa tujuan berdasarkan jarak terpendek (haversine). Bisa dikombinasikan dengan auto-dispatch.',
  })
  async optimize(@Body() dto: OptimizeRouteDto): Promise<Record<string, unknown>> {
    return this.service.optimizeRoute(dto);
  }

  @Post('auto-dispatch')
  @ApiOperation({
    summary: 'Auto dispatch shipment ke driver tersedia',
    description:
      'Secara otomatis menugaskan shipment PENDING ke driver AVAILABLE menggunakan strategi: nearest, balanced, atau priority.',
  })
  async autoDispatch(@Body() dto: AutoDispatchDto): Promise<Record<string, unknown>> {
    return this.service.autoDispatch(dto);
  }
}
