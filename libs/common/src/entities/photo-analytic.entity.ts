import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('photo_analytics')
@Index(['photoId'], { unique: true })
@Index(['userId'])
export class PhotoAnalytic {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() photoId: string;
  @Column() userId: string;
  @Column({ type: 'int', default: 0 }) totalViews: number;
  @Column({ type: 'int', default: 0 }) likesReceived: number;
  @Column({ type: 'int', default: 0 }) passesAfterView: number;
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 }) conversionRate: number;
  @Column({ type: 'int', default: 0 }) superLikesReceived: number;
  @Column({ type: 'decimal', precision: 5, distance: 2, default: 0 }) avgViewDurationMs: number;
  @Column({ type: 'int', default: 0 }) order: number;
  @CreateDateColumn() createdAt: Date;
  @Column() updatedAt: Date;
}
