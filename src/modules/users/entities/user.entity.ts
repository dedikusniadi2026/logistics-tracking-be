/* eslint-disable prettier/prettier */
import {
     Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
      unique: true,
    })
    email!: string;

    @Column() 
    password!: string;

    @Column()
    phone!: string;

    @Column()
    role!: string;

    @Column({
      default: true,
    })
    isActive! : boolean;

    @Column({
      nullable: true,
    })

    refreshToken!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updateAt!: Date;




  }