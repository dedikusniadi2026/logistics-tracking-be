import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('delivery_history')
export class DeliveryHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  shipmentId!: number;

  @Column()
  status!: string; // e.g. PENDING, ASSIGNED, PICKED_UP, etc.

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.histories, {
    onDelete: 'CASCADE',
  })
  shipment!: Shipment;
}
