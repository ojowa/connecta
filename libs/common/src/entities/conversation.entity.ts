import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: 'direct' }) type: string;
  @Column({ nullable: true }) lastMessageId: string;
  @Column({ nullable: true }) lastMessageAt: Date;
  @CreateDateColumn() createdAt: Date;
}
