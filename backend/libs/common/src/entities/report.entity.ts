import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() reporterId: string;
  @Column() reportedId: string;
  @Column() reason: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'text', array: true, nullable: true }) evidenceUrls: string[];
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) reviewedBy: string;
  @Column({ nullable: true }) actionTaken: string;
  @CreateDateColumn() createdAt: Date;
}
