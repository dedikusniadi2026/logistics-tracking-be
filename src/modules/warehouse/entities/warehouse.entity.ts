import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WarehouseInventory } from './warehouse-inventory.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  code!: string; // e.g. WH-JKT-01

  @Column('text')
  address!: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ default: 'ACTIVE' }) // ACTIVE, INACTIVE
  status!: string;

  @Column('int', { default: 0 })
  totalCapacity!: number; // in units

  @Column()
  managerName!: string;

  @Column()
  managerPhone!: string;

  @OneToMany(() => WarehouseInventory, (inv) => inv.warehouse)
  inventory?: WarehouseInventory[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
