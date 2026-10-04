import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('moment_views')
@Index(['momentId', 'viewerId'], { unique: true })
export class MomentView {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() momentId: string;
  @Column() viewerId: string;
  @CreateDateColumn() viewedAt: Date;
}
