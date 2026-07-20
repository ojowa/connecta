import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('likes')
@Index(['userId', 'likedUserId'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() likedUserId: string;
  @Column({ default: false }) isSuperLike: boolean;
  @CreateDateColumn() createdAt: Date;
}
