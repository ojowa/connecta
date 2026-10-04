import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('profile_views')
@Index(['profileId', 'viewerId'], { unique: true })
export class ProfileView {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() profileId: string;
  @Column() viewerId: string;
  @CreateDateColumn() viewedAt: Date;
}
