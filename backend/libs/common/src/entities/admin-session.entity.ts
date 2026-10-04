import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('admin_sessions')
export class AdminSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() adminId: string;
  @Column() tokenHash: string;
  @Column({ nullable: true }) ipAddress: string;
  @Column({ nullable: true }) userAgent: string;
  @Column() expiresAt: Date;
  @CreateDateColumn() createdAt: Date;
}
