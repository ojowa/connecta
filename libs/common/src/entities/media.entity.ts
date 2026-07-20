import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() url: string;
  @Column({ nullable: true }) thumbnailUrl: string;
  @Column() mimeType: string;
  @Column() sizeBytes: number;
  @Column() purpose: string;
  @Column({ default: 'active' }) status: string;
  @CreateDateColumn() createdAt: Date;
}
