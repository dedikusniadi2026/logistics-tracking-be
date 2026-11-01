import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('iot_devices')
export class IotDevice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  deviceId!: string; // hardware device identifier e.g. "TRACKER-001"

  @Column({ unique: true })
  imei!: string;

  @Column({ nullable: true })
  vehicleId?: number;

  @Column({ nullable: true })
  driverId?: number;

  @Column({ default: 'ACTIVE' }) // ACTIVE, INACTIVE, MAINTENANCE
  status!: string;

  @Column({ nullable: true })
  firmwareVersion?: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lastLatitude?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lastLongitude?: number;

  @Column('decimal', { nullable: true, precision: 6, scale: 2 })
  batteryLevel?: number; // percentage 0-100

  @Column('decimal', { nullable: true, precision: 6, scale: 2 })
  signalStrength?: number; // dBm or percentage

  @Column({ nullable: true })
  lastSeenAt?: Date;

  @Column('int', { default: 30 })
  reportIntervalSecs!: number; // how often device reports

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
