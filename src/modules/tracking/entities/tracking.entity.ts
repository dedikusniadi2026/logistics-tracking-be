import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('tracking')
export class Tracking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  shipmentId!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude!: number;

  @Column('decimal', { nullable: true, precision: 10, scale: 3 })
  speed?: number;

  @Column('decimal', { nullable: true, precision: 10, scale: 3 })
  heading?: number;

  @Column()
  status!: string; // current status when tracking was logged

  // Explicit timestamp tracking (client-provided). If omitted, service will set server time.
  @Column({ type: 'datetime' })
  timestamp!: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.trackings, {
    onDelete: 'CASCADE',
  })
  shipment!: Shipment;
}
