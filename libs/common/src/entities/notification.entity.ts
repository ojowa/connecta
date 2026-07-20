import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() type: string;
  @Column() title: string;
  @Column() body: string;
  @Column({ type: 'jsonb', nullable: true }) data: any;
  @Column({ nullable: true }) channel: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) readAt: Date;
  @Column({ nullable: true }) sentAt: Date;
  @CreateDateColumn() createdAt: Date;
}
