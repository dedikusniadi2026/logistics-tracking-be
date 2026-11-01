import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('fraud_alerts')
export class FraudAlert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  shipmentId!: number;

  @Column()
  ruleTriggered!: string; // e.g. "ROUTE_DEVIATION", "SPEED_ANOMALY"

  @Column()
  severity!: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column('text')
  description!: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ default: 'OPEN' }) // OPEN, INVESTIGATED, RESOLVED, FALSE_POSITIVE
  status!: string;

  @CreateDateColumn()
  detectedAt!: Date;

  @ManyToOne(() => Shipment, { onDelete: 'CASCADE' })
  shipment!: Shipment;
}
