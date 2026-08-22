import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index(['userId', 'deviceId'])
export class Session {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() deviceId: string;
  @Column({ nullable: true }) deviceName: string;
  @Column({ nullable: true }) deviceType: string;
  @Column({ nullable: true }) ipAddress: string;
  @Column({ nullable: true }) userAgent: string;
  @Column() refreshToken: string;
  @Column() expiresAt: Date;
  @Column({ default: true }) isActive: boolean;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
  @CreateDateColumn() createdAt: Date;
}
