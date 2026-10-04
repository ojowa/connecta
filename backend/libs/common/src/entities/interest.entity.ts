import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('interests')
export class Interest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) category: string;
  @Column({ nullable: true }) icon: string;
  @Column({ default: true }) isActive: boolean;
}
