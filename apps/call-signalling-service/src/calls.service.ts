import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallSession, User } from '@app/common/entities';

interface StartCallData {
  callerId: string;
  recipientId: string;
  callType?: string;
}

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(CallSession) private callRepo: Repository<CallSession>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async startCall(data: StartCallData) {
    const { callerId, recipientId, callType } = data;

    if (callerId === recipientId) {
      throw new BadRequestException('Cannot call yourself');
    }

    const recipient = await this.userRepo.findOne({ where: { id: recipientId } });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    const activeCall = await this.callRepo.findOne({
      where: [
        { callerId, status: 'ringing' },
        { callerId, status: 'connected' },
        { calleeId: recipientId, status: 'ringing' },
        { calleeId: recipientId, status: 'connected' },
      ],
    });
    if (activeCall) {
      throw new BadRequestException('Already in an active call');
    }

    const call = await this.callRepo.save(
      this.callRepo.create({
        callerId,
        calleeId: recipientId,
        callType: callType || 'video',
        status: 'ringing',
      }),
    );

    return {
      callId: call.id,
      callType: call.callType,
      status: 'ringing',
      createdAt: call.startedAt,
    };
  }

  async answerCall(callId: string, userId: string) {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    if (call.calleeId !== userId) throw new BadRequestException('Not your call');
    if (call.status !== 'ringing') throw new BadRequestException('Call is not ringing');

    await this.callRepo.update(callId, {
      status: 'connected',
      connectedAt: new Date(),
    });

    return { callId, status: 'connected', connectedAt: new Date() };
  }

  async rejectCall(callId: string, userId: string, reason?: string) {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    if (call.calleeId !== userId && call.callerId !== userId) {
      throw new BadRequestException('Not your call');
    }

    await this.callRepo.update(callId, {
      status: 'rejected',
      endedAt: new Date(),
      endReason: reason || 'declined',
    });

    return { callId, status: 'rejected', rejectedBy: userId, reason: reason || 'declined' };
  }

  async endCall(callId: string, userId: string, reason?: string) {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');

    const duration = call.connectedAt
      ? Math.floor((Date.now() - call.connectedAt.getTime()) / 1000)
      : 0;

    await this.callRepo.update(callId, {
      status: 'ended',
      endedAt: new Date(),
      duration,
      endReason: reason || 'user_ended',
    });

    return { callId, status: 'ended', durationSeconds: duration, endedBy: userId, endedAt: new Date() };
  }

  async getHistory(userId: string, page = 1, limit = 20, callType?: string, direction?: string) {
    const qb = this.callRepo.createQueryBuilder('c');

    if (direction === 'outgoing') {
      qb.where('c.callerId = :userId', { userId });
    } else if (direction === 'incoming') {
      qb.where('c.calleeId = :userId', { userId });
    } else {
      qb.where('(c.callerId = :userId OR c.calleeId = :userId)', { userId });
    }

    if (callType) {
      qb.andWhere('c.callType = :callType', { callType });
    }

    const total = await qb.getCount();
    const calls = await qb
      .orderBy('c.startedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      calls,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async getActiveCall(userId: string): Promise<CallSession | null> {
    return this.callRepo.findOne({
      where: [
        { callerId: userId, status: 'ringing' },
        { callerId: userId, status: 'connected' },
        { calleeId: userId, status: 'ringing' },
        { calleeId: userId, status: 'connected' },
      ],
    });
  }
}
