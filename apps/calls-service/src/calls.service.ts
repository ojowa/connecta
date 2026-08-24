import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CallSession } from '@app/common/entities';

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(CallSession) private callRepo: Repository<CallSession>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startCall(callerId: string, data: any) {
    const call = this.callRepo.create({ callerId, calleeId: data.recipientId, callType: data.callType || 'voice', status: 'ringing' });
    const saved = await this.callRepo.save(call);
    this.eventEmitter.emit('call.started', { callId: saved.id, callerId, recipientId: data.recipientId, callType: data.callType });
    return saved;
  }

  async answerCall(callId: string, userId: string) {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    if (call.calleeId !== userId) throw new BadRequestException('Not the recipient');
    await this.callRepo.update(callId, { status: 'active', connectedAt: new Date() });
    this.eventEmitter.emit('call.answered', { callId, userId });
    return { callId, status: 'active' };
  }

  async rejectCall(callId: string, userId: string, reason?: string) {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    await this.callRepo.update(callId, { status: 'rejected', endedAt: new Date(), endReason: reason || 'rejected' });
    this.eventEmitter.emit('call.rejected', { callId, userId, reason });
    return { callId, status: 'rejected' };
  }

  async endCall(callId: string, userId: string, reason?: string) {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    const duration = call.connectedAt ? Math.floor((Date.now() - call.connectedAt.getTime()) / 1000) : 0;
    await this.callRepo.update(callId, { status: 'ended', endedAt: new Date(), duration, endReason: reason || 'ended' });
    this.eventEmitter.emit('call.ended', { callId, userId, duration, reason });
    return { callId, status: 'ended', duration };
  }

  async getHistory(userId: string, page = 1, limit = 20, callType?: string, direction?: string) {
    const qb = this.callRepo.createQueryBuilder('c').where('(c.callerId = :userId OR c.calleeId = :userId)', { userId });
    if (callType) qb.andWhere('c.callType = :callType', { callType });
    if (direction === 'outgoing') qb.andWhere('c.callerId = :userId', { userId });
    if (direction === 'incoming') qb.andWhere('c.calleeId = :userId', { userId });
    const calls = await qb.orderBy('c.startedAt', 'DESC').skip((page - 1) * limit).take(limit).getMany();
    return { calls, meta: { page, limit, hasMore: calls.length === limit } };
  }
}
