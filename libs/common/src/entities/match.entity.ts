import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('matches')
@Index(['userAId', 'userBId'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userAId: string;
  @Column() userBId: string;
  @Column({ nullable: true }) conversationId: string;
  @CreateDateColumn() matchedAt: Date;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 'like' }) matchedVia: string;
}
