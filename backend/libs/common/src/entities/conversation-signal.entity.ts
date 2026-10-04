import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('conversation_signals')
@Index(['userId', 'matchId'])
@Index(['matchId'])
export class ConversationSignal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() matchId: string;
  @Column({ type: 'int', default: 0 }) messagesSent: number;
  @Column({ type: 'int', default: 0 }) messagesReceived: number;
  @Column({ type: 'int', default: 0 }) avgMessageLength: number;
  @Column({ type: 'int', default: 0 }) avgResponseTimeMinutes: number;
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 }) responseRate: number;
  @Column({ default: false }) didMeet: boolean;
  @Column({ type: 'int', nullable: true }) conversationDurationHours: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @Column() updatedAt: Date;
}
