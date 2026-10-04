import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('photo_likes')
@Index(['userId', 'photoId'], { unique: true })
export class PhotoLike {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() photoId: string;
  @Column() profileId: string;
  @CreateDateColumn() createdAt: Date;
}
