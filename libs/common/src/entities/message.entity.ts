import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() conversationId: string;
  @Column() senderId: string;
  @Column({ default: 'text' }) type: string;
  @Column({ nullable: true }) content: string;
  @Column({ nullable: true }) mediaUrl: string;
  @Column({ nullable: true }) encryptedContent: string;
  @Column({ nullable: true }) replyToId: string;
  @Column({ default: 'sent' }) status: string;
  @Column({ default: false }) isDeleted: boolean;
  @Column({ nullable: true }) deletedAt: Date;
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
