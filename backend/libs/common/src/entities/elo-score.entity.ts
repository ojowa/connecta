import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('elo_scores')
@Index(['userId'], { unique: true })
export class EloScore {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 1200 }) score: number;
  @Column({ type: 'int', default: 0 }) totalLikesReceived: number;
  @Column({ type: 'int', default: 0 }) totalLikesGiven: number;
  @Column({ type: 'int', default: 0 }) totalMatches: number;
  @Column({ type: 'int', default: 0 }) totalConversations: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) responseRate: number;
  @Column({ type: 'int', default: 0 }) avgResponseTimeMinutes: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.5 }) attractivenessPercentile: number;
  @Column({ type: 'int', default: 0 }) profileViews: number;
  @UpdateDateColumn() updatedAt: Date;
}
