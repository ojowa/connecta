import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) userId: string;
  @Column({ default: 18 }) ageMin: number;
  @Column({ default: 50 }) ageMax: number;
  @Column({ default: 50 }) maxDistanceKm: number;
  @Column({ default: 'opposite' }) showMe: string;
  @Column({ default: false }) showVerifiedOnly: boolean;
  @Column({ default: true }) showProfilesWithPhotosOnly: boolean;
  @Column({ default: false }) globalDiscovery: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
