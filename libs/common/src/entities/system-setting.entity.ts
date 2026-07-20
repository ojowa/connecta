import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) key: string;
  @Column({ type: 'jsonb' }) value: any;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) updatedBy: string;
  @UpdateDateColumn() updatedAt: Date;
}
