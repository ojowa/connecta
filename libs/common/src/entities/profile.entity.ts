import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Photo } from './photo.entity';

@Entity('profiles')
@Index(['userId'], { unique: true })
export class Profile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) userId: string;
  @Column() firstName: string;
  @Column({ nullable: true }) lastName: string;
  @Column({ nullable: true }) bio: string;
  @Column({ type: 'date', nullable: true }) dateOfBirth: Date;
  @Column({ nullable: true }) gender: string;
  @Column({ nullable: true }) jobTitle: string;
  @Column({ nullable: true }) company: string;
  @Column({ nullable: true }) school: string;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) latitude: number;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) longitude: number;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) country: string;
  @Column({ nullable: true }) relationshipGoal: string;
  @Column({ default: false }) verified: boolean;
  @Column({ nullable: true }) verifiedAt: Date;
  @Column({ default: 0 }) completionPercentage: number;
  @Column({ default: true }) isActive: boolean;
  @OneToMany(() => Photo, (photo) => photo.profile, { cascade: true }) photos: Photo[];
  @Column({ type: 'jsonb', nullable: true }) prompts: Array<{ question: string; answer: string }>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
