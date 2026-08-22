import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('photos')
@Index(['profileId', 'order'])
export class Photo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() profileId: string;
  @Column() url: string;
  @Column({ nullable: true }) thumbnailUrl: string;
  @Column({ default: 0 }) order: number;
  @Column({ default: false }) isPrimary: boolean;
  @ManyToOne(() => Profile, (profile) => profile.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
  @CreateDateColumn() createdAt: Date;
}
