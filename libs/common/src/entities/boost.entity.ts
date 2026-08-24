import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('boosts')
@Index(['userId', 'activeAt'])
export class Boost {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ default: 30 }) durationMinutes: number;
  @Column({ type: 'timestamp', nullable: true }) expiresAt: Date;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) viewsGained: number;
  @Column({ default: 0 }) likesGained: number;
  @CreateDateColumn() activeAt: Date;
}
