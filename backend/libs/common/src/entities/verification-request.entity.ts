import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('verification_requests')
export class VerificationRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() selfieUrl: string;
  @Column({ default: 'pending' }) status: 'pending' | 'approved' | 'rejected';
  @Column({ type: 'int', nullable: true }) faceWidth: number;
  @Column({ type: 'int', nullable: true }) faceHeight: number;
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true }) faceConfidence: number;
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true }) livenessScore: number;
  @Column({ type: 'int', nullable: true }) imageWidth: number;
  @Column({ type: 'int', nullable: true }) imageHeight: number;
  @Column({ type: 'int', nullable: true }) fileSize: number;
  @Column({ nullable: true }) reviewedBy: string;
  @Column({ nullable: true }) reviewedAt: Date;
  @Column({ nullable: true }) rejectionReason: string;
  @Column({ type: 'jsonb', nullable: true }) faceLandmarks: Record<string, unknown>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
