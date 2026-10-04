import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @Column() name: string;
  @Column({ default: 'moderator' }) role: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: false }) tfaEnabled: boolean;
  @Column({ nullable: true }) tfaSecret: string;
  @Column({ nullable: true }) lastLoginAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
