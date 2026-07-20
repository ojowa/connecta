import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() displayName: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) priceMonthly: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) priceYearly: number;
  @Column({ default: 'NGN' }) currency: string;
  @Column({ type: 'jsonb' }) features: any;
  @Column({ nullable: true }) dailyLikes: number;
  @Column({ nullable: true }) dailySuperLikes: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) sortOrder: number;
  @CreateDateColumn() createdAt: Date;
}
