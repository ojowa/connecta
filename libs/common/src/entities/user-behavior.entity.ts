import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('user_behaviors')
@Index(['userId', 'targetUserId'])
@Index(['userId', 'action'])
@Index(['targetUserId'])
@Index(['createdAt'])
export class UserBehavior {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() targetUserId: string;
  @Column() action: 'like' | 'pass' | 'super_like' | 'view_profile' | 'send_message' | 'reply_message' | 'unmatch';
  @Column({ type: 'int', nullable: true }) viewDurationMs: number;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) targetLat: number;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) targetLon: number;
  @Column({ type: 'int', nullable: true }) targetAge: number;
  @Column({ nullable: true }) targetGender: string;
  @Column({ type: 'jsonb', nullable: true }) targetInterests: string[];
  @Column({ nullable: true }) targetJobTitle: string;
  @Column({ nullable: true }) targetSchool: string;
  @Column({ nullable: true }) targetCity: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) distanceKm: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) compatibilityScore: number;
  @Column({ default: false }) resultedInMatch: boolean;
  @Column({ default: false }) resultedInConversation: boolean;
  @Column({ type: 'int', nullable: true }) responseTimeMinutes: number;
  @CreateDateColumn() createdAt: Date;
}
