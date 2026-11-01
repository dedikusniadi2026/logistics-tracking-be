import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseInventory } from './entities/warehouse-inventory.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { AdjustStockDto, ScanBarcodeDto } from './dto/scan-barcode.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(WarehouseInventory)
    private readonly inventoryRepo: Repository<WarehouseInventory>,
  ) {}

  // ── Warehouse CRUD ─────────────────────────────────────────────
  async createWarehouse(dto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(warehouse);
  }

  async findAllWarehouses() {
    return this.warehouseRepo.find({ relations: { inventory: true } });
  }

  async findOneWarehouse(id: number) {
    const wh = await this.warehouseRepo.findOne({ where: { id }, relations: { inventory: true } });
    if (!wh) throw new NotFoundException(`Warehouse ${id} not found`);
    return wh;
  }

  async updateWarehouse(id: number, dto: UpdateWarehouseDto) {
    const wh = await this.findOneWarehouse(id);
    Object.assign(wh, dto);
    return this.warehouseRepo.save(wh);
  }

  async removeWarehouse(id: number) {
    const wh = await this.findOneWarehouse(id);
    return this.warehouseRepo.remove(wh);
  }

  // ── Inventory CRUD ─────────────────────────────────────────────
  async addInventory(dto: CreateInventoryDto) {
    await this.findOneWarehouse(dto.warehouseId);
    const item = this.inventoryRepo.create({ ...dto, minStockLevel: dto.minStockLevel ?? 0 });
    return this.inventoryRepo.save(item);
  }

  async findInventory(warehouseId: number) {
    return this.inventoryRepo.find({ where: { warehouseId } });
  }

  async getLowStockAlerts() {
    const items = await this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.quantity <= inv.minStockLevel')
      .getMany();
    return items;
  }

  // ── Barcode / QR Scanning ──────────────────────────────────────
  async scanBarcode(dto: ScanBarcodeDto) {
    const query = this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.barcodeValue = :code', { code: dto.barcodeValue });

    if (dto.warehouseId) {
      query.andWhere('inv.warehouseId = :wid', { wid: dto.warehouseId });
    }

    const item = await query.getOne();
    if (!item) throw new NotFoundException(`Barcode/QR "${dto.barcodeValue}" tidak ditemukan`);

    return {
      found: true,
      item,
      isLowStock: item.quantity <= item.minStockLevel,
    };
  }

  async adjustStock(inventoryId: number, dto: AdjustStockDto) {
    const item = await this.inventoryRepo.findOne({ where: { id: inventoryId } });
    if (!item) throw new NotFoundException(`Inventory item ${inventoryId} not found`);

    const newQty = item.quantity + dto.adjustment;
    if (newQty < 0) throw new BadRequestException('Stock tidak boleh negatif');

    item.quantity = newQty;
    const saved = await this.inventoryRepo.save(item);

    return {
      ...saved,
      adjusted: dto.adjustment,
      reason: dto.reason,
      isLowStock: saved.quantity <= saved.minStockLevel,
    };
  }

  // ── Multi-Warehouse Distribution ───────────────────────────────
  async getDistributionSummary() {
    const warehouses = await this.warehouseRepo.find({ relations: { inventory: true } });

    return warehouses.map((wh) => {
      const totalItems = wh.inventory?.length ?? 0;
      const totalStock = wh.inventory?.reduce((s, i) => s + i.quantity, 0) ?? 0;
      const lowStockItems = wh.inventory?.filter((i) => i.quantity <= i.minStockLevel) ?? [];

      return {
        warehouseId: wh.id,
        name: wh.name,
        code: wh.code,
        address: wh.address,
        totalCapacity: wh.totalCapacity,
        totalItems,
        totalStock,
        utilizationPercent:
          wh.totalCapacity > 0 ? Math.round((totalStock / wh.totalCapacity) * 100) : 0,
        lowStockCount: lowStockItems.length,
        status: wh.status,
      };
    });
  }

  async findSkuAcrossWarehouses(sku: string) {
    return this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.sku = :sku', { sku })
      .getMany();
  }
}
