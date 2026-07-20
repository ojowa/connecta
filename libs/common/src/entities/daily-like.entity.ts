import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('daily_likes')
@Index(['userId', 'date'], { unique: true })
export class DailyLike {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'date', default: () => 'CURRENT_DATE' }) date: Date;
  @Column({ default: 0 }) likesGiven: number;
  @Column({ default: 0 }) superLikesGiven: number;
}
