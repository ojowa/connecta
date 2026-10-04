import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('biometric_credentials')
@Index(['userId', 'credentialId'], { unique: true })
export class BiometricCredential {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() deviceId: string;
  @Column() biometricType: string;
  @Column({ type: 'text' }) publicKey: string;
  @Column({ unique: true }) credentialId: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}
