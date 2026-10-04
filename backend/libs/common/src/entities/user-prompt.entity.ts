import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('user_prompts')
@Index(['userId', 'question'], { unique: true })
export class UserPrompt {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() question: string;
  @Column() answer: string;
  @Column({ default: 0 }) sortOrder: number;
  @CreateDateColumn() createdAt: Date;
}
