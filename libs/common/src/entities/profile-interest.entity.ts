import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';
import { Interest } from './interest.entity';

@Entity('profile_interests')
export class ProfileInterest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() profileId: string;
  @Column() interestId: string;
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
  @ManyToOne(() => Interest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interestId' })
  interest: Interest;
}
