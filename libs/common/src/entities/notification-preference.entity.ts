import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) userId: string;
  @Column({ default: true }) matchNotify: boolean;
  @Column({ default: true }) messageNotify: boolean;
  @Column({ default: true }) likeNotify: boolean;
  @Column({ default: true }) superLikeNotify: boolean;
  @Column({ default: true }) callNotify: boolean;
  @Column({ default: true }) subscriptionNotify: boolean;
  @Column({ default: false }) marketingNotify: boolean;
  @Column({ type: 'time', nullable: true }) quietHoursStart: string;
  @Column({ type: 'time', nullable: true }) quietHoursEnd: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
