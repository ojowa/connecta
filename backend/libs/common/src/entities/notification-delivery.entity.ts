import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notification_deliveries')
@Index(['notificationId'])
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() notificationId: string;
  @Column() userId: string;
  @Column() type: string;
  @Column() title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ nullable: true }) channel: string;
  @Column({ nullable: true }) platform: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ default: false }) delivered: boolean;
  @Column({ default: false }) opened: boolean;
  @Column({ default: false }) clicked: boolean;
  @Column({ nullable: true }) deliveredAt: Date;
  @Column({ nullable: true }) openedAt: Date;
  @Column({ nullable: true }) clickedAt: Date;
  @Column({ nullable: true }) failureReason: string;
  @Column({ type: 'jsonb', nullable: true }) metadata: any;
  @CreateDateColumn() createdAt: Date;
}
