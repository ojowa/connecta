import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('read_receipts')
@Index(['messageId', 'userId'], { unique: true })
export class ReadReceipt {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() messageId: string;
  @Column() userId: string;
  @Column({ default: () => 'NOW()' }) readAt: Date;
}
