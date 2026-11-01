import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Entity('warehouse_inventory')
export class WarehouseInventory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  warehouseId!: number;

  @Column()
  sku!: string; // Stock Keeping Unit

  @Column()
  productName!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('int', { default: 0 })
  quantity!: number;

  @Column('int', { default: 0 })
  minStockLevel!: number; // alert threshold

  @Column({ nullable: true })
  barcodeValue?: string; // barcode or QR data

  @Column({ nullable: true })
  location?: string; // shelf/rack e.g. "A-12-3"

  @Column({ default: 'ACTIVE' })
  status!: string;

  @ManyToOne(() => Warehouse, (wh) => wh.inventory, { onDelete: 'CASCADE' })
  warehouse!: Warehouse;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
