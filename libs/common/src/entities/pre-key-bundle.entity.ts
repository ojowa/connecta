import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('pre_key_bundles')
@Index(['userId', 'deviceId'])
@Index(['userId', 'keyType'])
export class PreKeyBundle {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ default: 1 }) deviceId: number;
  @Column() keyType: string;
  @Column({ nullable: true }) keyId: number;
  @Column() publicKey: string;
  @Column({ nullable: true }) signature: string;
  @Column({ default: false }) used: boolean;
  @CreateDateColumn() uploadedAt: Date;
}
