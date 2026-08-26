import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('appeals')
export class Appeal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() reason: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'text', array: true, nullable: true }) evidenceUrls: string[];
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) reviewedBy: string;
  @Column({ nullable: true }) decision: string;
  @Column({ nullable: true }) decisionNotes: string;
  @Column({ nullable: true }) reviewedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
