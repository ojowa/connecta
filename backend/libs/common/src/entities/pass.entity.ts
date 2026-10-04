import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('passes')
@Index(['userId', 'passedUserId'], { unique: true })
export class Pass {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() passedUserId: string;
  @CreateDateColumn() createdAt: Date;
}
