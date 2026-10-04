import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('message_reactions')
@Index(['messageId', 'userId', 'emoji'], { unique: true })
export class MessageReaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() messageId: string;
  @Column() userId: string;
  @Column() emoji: string;
  @CreateDateColumn() createdAt: Date;
}
