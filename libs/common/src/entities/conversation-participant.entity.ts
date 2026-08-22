import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('conversation_participants')
@Index(['conversationId', 'userId'], { unique: true })
export class ConversationParticipant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() conversationId: string;
  @Column() userId: string;
  @Column({ nullable: true }) lastReadAt: Date;
  @Column({ default: 0 }) unreadCount: number;
  @Column({ default: false }) isMuted: boolean;
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
  @CreateDateColumn() joinedAt: Date;
}
