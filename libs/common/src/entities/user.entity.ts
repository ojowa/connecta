import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DEACTIVATED = 'deactivated',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true, where: '"phone" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column() passwordHash: string;
  @Column({ nullable: true }) fullName: string;
  @Column({ type: 'date', nullable: true }) dateOfBirth: Date;
  @Column({ nullable: true }) gender: string;
  @Column({ default: false }) emailVerified: boolean;
  @Column({ default: false }) phoneVerified: boolean;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER }) role: UserRole;
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;
  @Column({ nullable: true }) lastLoginAt: Date;
  @Column({ nullable: true }) lastActiveAt: Date;
  @Column({ default: 0 }) loginAttempts: number;
  @Column({ nullable: true }) lockUntil: Date;
  @Column({ default: false }) incognitoMode: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
