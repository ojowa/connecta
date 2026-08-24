import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('profile_prompts')
export class ProfilePrompt {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() question: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) sortOrder: number;
  @CreateDateColumn() createdAt: Date;
}
