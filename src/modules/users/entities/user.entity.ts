import { Role } from '@app/common/types/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  first_name!: string;

  @Column({ type: 'varchar', length: 50 })
  second_name!: string;

  @Column({ type: 'varchar', length: 100, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', unique: true })
  phone!: string;

  @Column({ default: Role.DEFAULT, enum: Role })
  role!: Role;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
