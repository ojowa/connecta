import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('daily_streaks')
@Index(['userId'], { unique: true })
export class DailyStreak {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ default: 0 }) currentStreak: number;
  @Column({ default: 0 }) longestStreak: number;
  @Column({ type: 'timestamp', nullable: true }) lastCheckInAt: Date;
  @Column({ type: 'int', default: 0 }) totalCheckIns: number;
  @Column({ type: 'simple-json', nullable: true }) claimedRewards: string[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
