import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('call_sessions')
export class CallSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() callerId: string;
  @Column() calleeId: string;
  @Column() callType: string;
  @Column({ default: 'ringing' }) status: string;
  @Column({ nullable: true }) connectedAt: Date;
  @Column({ nullable: true }) endedAt: Date;
  @Column({ nullable: true }) duration: number;
  @Column({ nullable: true }) endReason: string;
  @CreateDateColumn() startedAt: Date;
}
