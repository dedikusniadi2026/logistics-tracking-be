import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // e.g. "Standard", "Express", "Same Day"

  @Column('int')
  maxDeliveryHours!: number; // SLA batas waktu pengiriman dalam jam

  @Column('int', { default: 80 })
  warningThresholdPercent!: number; // persen dari SLA sebelum warning dikirim

  @Column({ default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
