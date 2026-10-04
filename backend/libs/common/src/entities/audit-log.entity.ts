import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() adminId: string;
  @Column() action: string;
  @Column({ nullable: true }) targetType: string;
  @Column({ nullable: true }) targetId: string;
  @Column({ type: 'jsonb', nullable: true }) details: any;
  @Column({ nullable: true }) ipAddress: string;
  @CreateDateColumn() createdAt: Date;
}
