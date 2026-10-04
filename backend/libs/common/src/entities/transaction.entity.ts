import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ nullable: true }) subscriptionId: string;
  @Column() type: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ default: 'NGN' }) currency: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) paymentMethod: string;
  @Column({ nullable: true }) gateway: string;
  @Column({ nullable: true }) reference: string;
  @Column({ nullable: true }) gatewayRef: string;
  @Column({ type: 'jsonb', nullable: true }) gatewayResponse: any;
  @Column({ type: 'jsonb', nullable: true }) metadata: any;
  @Column({ nullable: true }) completedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
