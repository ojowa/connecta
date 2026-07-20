import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plan } from './plan.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() planId: string;
  @Column({ default: 'active' }) status: string;
  @Column({ default: 'monthly' }) billingPeriod: string;
  @Column() startedAt: Date;
  @Column({ nullable: true }) currentPeriodStart: Date;
  @Column({ nullable: true }) currentPeriodEnd: Date;
  @Column({ nullable: true }) cancelledAt: Date;
  @Column({ default: true }) autoRenew: boolean;
  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'planId' }) plan: Plan;
  @CreateDateColumn() createdAt: Date;
}
