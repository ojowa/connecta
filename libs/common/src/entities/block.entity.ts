import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('blocks')
@Index(['blockerId', 'blockedId'], { unique: true })
export class Block {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() blockerId: string;
  @Column() blockedId: string;
  @Column({ nullable: true }) reason: string;
  @CreateDateColumn() createdAt: Date;
}
