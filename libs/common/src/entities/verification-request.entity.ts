import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('verification_requests')
export class VerificationRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() selfieUrl: string;
  @Column({ default: 'pending' }) status: 'pending' | 'approved' | 'rejected';
  @Column({ nullable: true }) reviewedAt: Date;
  @Column({ nullable: true }) rejectionReason: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
