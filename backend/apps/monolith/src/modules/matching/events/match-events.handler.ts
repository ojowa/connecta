import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  Match,
  Like,
  Conversation,
  ConversationParticipant,
  User,
  Profile,
  Notification,
} from '@app/common/entities';

@Injectable()
export class MatchEventsHandler {
  private readonly logger = new Logger('MatchEventsHandler');

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  @OnEvent('match.created')
  async handleMatchCreated(payload: {
    matchId: string;
    user1Id: string;
    user2Id: string;
    matchedVia?: string;
  }) {
    this.logger.log(`Handling match.created: ${payload.matchId}`);

    const conversation = this.conversationRepository.create({});
    const savedConversation = await this.conversationRepository.save(conversation);

    await this.matchRepository.update(payload.matchId, {
      conversationId: savedConversation.id,
    });

    await this.participantRepository.save([
      this.participantRepository.create({
        conversationId: savedConversation.id,
        userId: payload.user1Id,
      }),
      this.participantRepository.create({
        conversationId: savedConversation.id,
        userId: payload.user2Id,
      }),
    ]);

    const profileA = await this.profileRepository.findOne({ where: { userId: payload.user1Id } });
    const profileB = await this.profileRepository.findOne({ where: { userId: payload.user2Id } });

    if (profileA) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: payload.user1Id,
          type: 'new_match',
          title: 'New Match!',
          body: `You matched with ${profileB?.firstName || 'someone'}! Send a message to start chatting.`,
          data: { matchId: payload.matchId, conversationId: savedConversation.id },
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }

    if (profileB) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: payload.user2Id,
          type: 'new_match',
          title: 'New Match!',
          body: `You matched with ${profileA?.firstName || 'someone'}! Send a message to start chatting.`,
          data: { matchId: payload.matchId, conversationId: savedConversation.id },
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }
  }

  @OnEvent('match.mutual')
  async handleMatchMutual(payload: { matchId: string; user1Id: string; user2Id: string }) {
    this.logger.log(`Handling match.mutual: ${payload.matchId}`);

    const userA = await this.userRepository.findOne({ where: { id: payload.user1Id } });
    const userB = await this.userRepository.findOne({ where: { id: payload.user2Id } });

    if (userA && userB) {
      this.logger.log(`Mutual match established between ${userA.email} and ${userB.email}`);
    }
  }

  @OnEvent('super_like.sent')
  async handleSuperLikeSent(payload: { fromUserId: string; toUserId: string; matchId?: string }) {
    this.logger.log(`Handling super_like.sent from ${payload.fromUserId} to ${payload.toUserId}`);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.toUserId,
        type: 'super_like',
        title: 'Super Like!',
        body: 'Someone super liked you! Check your discover feed.',
        data: { fromUserId: payload.fromUserId, matchId: payload.matchId },
        status: 'sent',
        sentAt: new Date(),
      }),
    );
  }

  @OnEvent('match.unmatch')
  async handleUnmatch(payload: { matchId: string; userId: string }) {
    this.logger.log(`Handling unmatch: ${payload.matchId}`);

    await this.matchRepository.update(payload.matchId, { isActive: false });

    const match = await this.matchRepository.findOne({ where: { id: payload.matchId } });
    if (match && match.conversationId) {
      const participants = await this.participantRepository.find({
        where: { conversationId: match.conversationId },
      });
      for (const p of participants) {
        if (p.userId === payload.userId) {
          await this.participantRepository.update(p.id, { isMuted: true });
        }
      }
    }
  }
}
