import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('matches')
@Index(['user1Id', 'user2Id'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() user1Id: string;
  @Column() user2Id: string;
  @Column({ nullable: true }) conversationId: string;
  @CreateDateColumn() matchedAt: Date;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 'like' }) matchedVia: string;
}
