import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IotService } from './iot.service';
import { IotTelemetryDto, RegisterIotDeviceDto } from './dto/iot-telemetry.dto';

@ApiTags('IoT Vehicle Tracking')
@Controller('iot')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  // Device registration and management require auth
  @Post('devices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Daftarkan IoT device/GPS tracker' })
  registerDevice(@Body() dto: RegisterIotDeviceDto) {
    return this.iotService.registerDevice(dto);
  }

  @Get('devices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Daftar semua IoT device' })
  getAllDevices() {
    return this.iotService.getAllDevices();
  }

  @Get('devices/:deviceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detail IoT device' })
  getDevice(@Param('deviceId') deviceId: string) {
    return this.iotService.getDevice(deviceId);
  }

  @Get('fleet')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Status armada real-time (semua device aktif)',
    description: 'Menampilkan online/offline status, posisi terakhir, dan baterai semua GPS tracker',
  })
  fleetStatus() {
    return this.iotService.getFleetStatus();
  }

  // Telemetry endpoint is open (called by IoT device firmware directly)
  @Post('telemetry')
  @ApiOperation({
    summary: 'Terima data telemetri dari IoT device (no auth required)',
    description:
      'Endpoint ini dipanggil langsung oleh firmware GPS tracker. Akan menyimpan tracking point jika ada shipment aktif dan broadcast via WebSocket.',
  })
  receiveTelemetry(@Body() dto: IotTelemetryDto) {
    return this.iotService.processTelemetry(dto);
  }

  @Post('devices/:deviceId/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update status device (ACTIVE/INACTIVE/MAINTENANCE)' })
  updateStatus(
    @Param('deviceId') deviceId: string,
    @Body() body: { status: string },
  ) {
    return this.iotService.updateDeviceStatus(deviceId, body.status);
  }
}
