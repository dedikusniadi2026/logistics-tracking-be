import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Tracking } from '../../tracking/entities/tracking.entity';
import { DeliveryHistory } from '../../delivery-history/entities/delivery-history.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  shipmentNumber!: string;

  @Column()
  customerId!: number;

  @Column({ nullable: true })
  driverId?: number;

  @Column({ nullable: true })
  vehicleId?: number;

  @Column()
  originAddress!: string;

  @Column()
  destinationAddress!: string;

  @Column('decimal', { precision: 10, scale: 7 })
  originLatitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  originLongitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  destinationLatitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  destinationLongitude!: number;

  @Column({ default: 'PENDING' }) // PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
  status!: string;

  @Column({ nullable: true })
  estimatedDelivery?: Date;

  @Column({ nullable: true })
  actualDelivery?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Customer, { eager: true, onDelete: 'RESTRICT' })
  customer!: Customer;

  @ManyToOne(() => Driver, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  driver?: Driver;

  @ManyToOne(() => Vehicle, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  vehicle?: Vehicle;

  @OneToMany(() => Tracking, (tracking) => tracking.shipment)
  trackings?: Tracking[];

  @OneToMany(() => DeliveryHistory, (history) => history.shipment)
  histories?: DeliveryHistory[];
}
