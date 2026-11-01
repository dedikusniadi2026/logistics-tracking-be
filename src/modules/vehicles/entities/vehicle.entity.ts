import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  plateNumber!: string;

  @Column()
  model!: string;

  @Column()
  type!: string; // e.g. Truck, Van, Motorcycle

  @Column('int')
  capacity!: number; // e.g. weight capacity in kg

  @Column({ default: 'ACTIVE' }) // ACTIVE, MAINTENANCE, INACTIVE
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
