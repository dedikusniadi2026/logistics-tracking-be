import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { AdjustStockDto, ScanBarcodeDto } from './dto/scan-barcode.dto';

@ApiTags('Warehouse (WMS)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ── Warehouses ──────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Buat gudang baru' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua gudang' })
  findAll() {
    return this.warehouseService.findAllWarehouses();
  }

  @Get('distribution')
  @ApiOperation({ summary: 'Ringkasan distribusi multi-gudang' })
  distribution() {
    return this.warehouseService.getDistributionSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail gudang' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.findOneWarehouse(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update gudang' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.updateWarehouse(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus gudang' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.removeWarehouse(id);
  }

  // ── Inventory ───────────────────────────────────────────────
  @Post('inventory')
  @ApiOperation({ summary: 'Tambah item inventaris ke gudang' })
  addInventory(@Body() dto: CreateInventoryDto) {
    return this.warehouseService.addInventory(dto);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Lihat inventaris gudang' })
  getInventory(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.findInventory(id);
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Item dengan stok rendah (semua gudang)' })
  lowStock() {
    return this.warehouseService.getLowStockAlerts();
  }

  @Get('inventory/sku/:sku')
  @ApiOperation({ summary: 'Cari SKU di semua gudang' })
  findSku(@Param('sku') sku: string) {
    return this.warehouseService.findSkuAcrossWarehouses(sku);
  }

  @Put('inventory/:inventoryId/adjust-stock')
  @ApiOperation({ summary: 'Sesuaikan stok item (stock opname / in/out)' })
  adjustStock(
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
    @Body() dto: AdjustStockDto,
  ) {
    return this.warehouseService.adjustStock(inventoryId, dto);
  }

  // ── Barcode / QR Scanning ────────────────────────────────────
  @Post('scan')
  @ApiOperation({ summary: 'Scan barcode / QR code untuk mencari item' })
  scan(@Body() dto: ScanBarcodeDto) {
    return this.warehouseService.scanBarcode(dto);
  }
}
