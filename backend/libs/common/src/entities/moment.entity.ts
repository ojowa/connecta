import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, DeleteDateColumn } from 'typeorm';

@Entity('moments')
@Index(['userId', 'expiresAt'])
@Index(['deletedAt'])
export class Moment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ nullable: true }) mediaUrl: string;
  @Column({ nullable: true }) caption: string;
  @Column({ nullable: true }) mediaType: string;
  @Column({ type: 'timestamp' }) expiresAt: Date;
  @Column({ default: 0 }) viewCount: number;
  @CreateDateColumn() createdAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
