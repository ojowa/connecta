import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Profile, Photo, Conversation, ConversationParticipant, Message, MessageReaction, ReadReceipt } from '@app/common/entities';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Photo) private photoRepo: Repository<Photo>,
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(MessageReaction) private reactRepo: Repository<MessageReaction>,
    @InjectRepository(ReadReceipt) private readRepo: Repository<ReadReceipt>,
  ) {}

  async getConversations(userId: string, page = 1, limit = 20, filter = 'all') {
    const participations = await this.partRepo.find({ where: { userId }, order: { joinedAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    const conversations = await Promise.all(participations.map(async (p) => {
      const conv = await this.convRepo.findOne({ where: { id: p.conversationId } });
      if (!conv) return null;
      const allParts = await this.partRepo.find({ where: { conversationId: p.conversationId } });
      const otherUserId = allParts.find(ap => ap.userId !== userId)?.userId;
      const otherUser = otherUserId ? await this.userRepo.findOne({ where: { id: otherUserId } }) : null;
      const otherProfile = otherUserId ? await this.profileRepo.findOne({ where: { userId: otherUserId } }) : null;
      const photo = otherUserId && otherProfile ? await this.photoRepo.findOne({ where: { profileId: otherProfile.id, isPrimary: true } }) : null;
      const lastMsg = conv.lastMessageId ? await this.msgRepo.findOne({ where: { id: conv.lastMessageId } }) : null;
      return {
        conversationId: conv.id, type: conv.type,
        participant: otherUser ? { userId: otherUser.id, fullName: otherUser.fullName, avatarUrl: photo?.url, isOnline: false, lastSeenAt: otherUser.lastActiveAt } : null,
        lastMessage: lastMsg ? { messageId: lastMsg.id, content: lastMsg.content, senderId: lastMsg.senderId, type: lastMsg.contentType, sentAt: lastMsg.createdAt } : null,
        unreadCount: p.unreadCount, isArchived: false, createdAt: conv.createdAt,
      };
    }));
    const total = await this.partRepo.count({ where: { userId } });
    return { conversations: conversations.filter(Boolean), meta: { page, limit, total, hasMore: total > page * limit } };
  }

  async getMessages(userId: string, conversationId: string, limit = 50, before?: string, after?: string) {
    const part = await this.partRepo.findOne({ where: { conversationId, userId } });
    if (!part) throw new ForbiddenException('Not a participant');
    const qb = this.msgRepo.createQueryBuilder('m').where('m.conversationId = :conversationId', { conversationId }).orderBy('m.createdAt', 'DESC').take(limit);
    if (before) qb.andWhere('m.createdAt < (SELECT "createdAt" FROM messages WHERE id = :before)', { before });
    if (after) qb.andWhere('m.createdAt > (SELECT "createdAt" FROM messages WHERE id = :after)', { after });
    const messages = await qb.getMany();
    return { messages, hasMore: messages.length === limit };
  }

  async sendMessage(userId: string, conversationId: string, data: any) {
    const part = await this.partRepo.findOne({ where: { conversationId, userId } });
    if (!part) throw new ForbiddenException('Not a participant');
    const msg = this.msgRepo.create({ conversationId, senderId: userId, contentType: data.type || 'text', content: data.content, encryptedContent: data.encryptedContent, replyToId: data.replyTo });
    const saved = await this.msgRepo.save(msg);
    await this.convRepo.update(conversationId, { lastMessageId: saved.id, lastMessageAt: new Date() });
    const otherParts = await this.partRepo.find({ where: { conversationId } });
    await Promise.all(otherParts.filter(p => p.userId !== userId).map(p => this.partRepo.update(p.id, { unreadCount: p.unreadCount + 1 })));
    return { message: { messageId: saved.id, conversationId, senderId: userId, content: saved.content, type: saved.contentType, status: 'sent', clientMessageId: data.clientMessageId, sentAt: saved.createdAt } };
  }

  async reactToMessage(userId: string, messageId: string, emoji: string, action: 'add' | 'remove') {
    if (action === 'add') {
      const existing = await this.reactRepo.findOne({ where: { messageId, userId, emoji } });
      if (!existing) await this.reactRepo.save(this.reactRepo.create({ messageId, userId, emoji }));
    } else {
      await this.reactRepo.delete({ messageId, userId, emoji });
    }
    const reactions = await this.reactRepo.find({ where: { messageId } });
    return { messageId, reactions: reactions.map(r => ({ emoji: r.emoji, userId: r.userId, reactedAt: r.createdAt })) };
  }

  async markAsRead(userId: string, conversationId: string, lastReadMessageId: string) {
    await this.partRepo.update({ conversationId, userId }, { lastReadAt: new Date(), unreadCount: 0 });
    return { conversationId, lastReadMessageId, readAt: new Date(), unreadCount: 0 };
  }

  async searchMessages(userId: string, query: string, conversationId?: string, page = 1, limit = 20) {
    const qb = this.msgRepo.createQueryBuilder('m')
      .innerJoin('conversation_participants', 'cp', 'cp.conversationId = m.conversationId AND cp.userId = :userId', { userId })
      .where('m.content ILIKE :query', { query: `%${query}%` })
      .andWhere('m.isDeleted = false');
    if (conversationId) qb.andWhere('m.conversationId = :conversationId', { conversationId });
    qb.orderBy('m.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const results = await qb.getMany();
    return { results, meta: { page, limit, total: results.length, hasMore: false } };
  }

  async deleteMessage(userId: string, messageId: string) {
    const msg = await this.msgRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== userId) throw new ForbiddenException('Can only delete your own messages');
    await this.msgRepo.update(messageId, { isDeleted: true, deletedAt: new Date() });
    return { deleted: true, messageId, visibleToSender: true, visibleToRecipient: false };
  }

  async sendTyping(userId: string, conversationId: string, isTyping: boolean) {
    const part = await this.partRepo.findOne({ where: { conversationId, userId } });
    if (!part) throw new ForbiddenException('Not a participant');
    const expiresAt = new Date(Date.now() + 8000);
    return { conversationId, isTyping, expiresAt };
  }
}
