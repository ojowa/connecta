import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('otp_codes')
export class OtpCode {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) userId: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column() code: string;
  @Column() purpose: string;
  @Column({ default: 0 }) attempts: number;
  @Column({ default: 3 }) maxAttempts: number;
  @Column() expiresAt: Date;
  @Column({ nullable: true }) verifiedAt: Date;
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' }) user: User;
  @CreateDateColumn() createdAt: Date;
}
