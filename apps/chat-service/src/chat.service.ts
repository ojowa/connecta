import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation, ConversationParticipant, Message, MessageReaction, ReadReceipt, User } from '@app/common/entities';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(MessageReaction) private reactionRepo: Repository<MessageReaction>,
    @InjectRepository(ReadReceipt) private readRepo: Repository<ReadReceipt>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getConversations(userId: string, page = 1, limit = 20) {
    const participations = await this.partRepo.find({ where: { userId }, order: { lastReadAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    const convIds = participations.map((p) => p.conversationId);
    const conversations = await this.convRepo.findByIds(convIds);
    return { conversations: conversations.map((c) => ({ ...c, unreadCount: participations.find((p) => p.conversationId === c.id)?.unreadCount || 0 })), meta: { page, limit, hasMore: participations.length === limit } };
  }

  async getMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const participation = await this.partRepo.findOne({ where: { conversationId, userId } });
    if (!participation) throw new BadRequestException('Not a participant');
    const messages = await this.msgRepo.find({ where: { conversationId }, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { messages, meta: { page, limit, hasMore: messages.length === limit } };
  }

  async sendMessage(userId: string, conversationId: string, data: any) {
    const participation = await this.partRepo.findOne({ where: { conversationId, userId } });
    if (!participation) throw new BadRequestException('Not a participant');
    const message = this.msgRepo.create({ conversationId, senderId: userId, content: data.content, type: data.type || 'text' });
    const saved = await this.msgRepo.save(message);
    await this.partRepo.update({ conversationId, userId: { not: userId } as any }, { unreadCount: () => 'unread_count + 1' });
    this.eventEmitter.emit('chat.message_sent', { conversationId, message: saved });
    return saved;
  }

  async deleteMessage(userId: string, conversationId: string, messageId: string) {
    const message = await this.msgRepo.findOne({ where: { id: messageId, conversationId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new BadRequestException('Not your message');
    await this.msgRepo.remove(message);
    return { deleted: true };
  }

  async reactToMessage(userId: string, conversationId: string, messageId: string, data: any) {
    const message = await this.msgRepo.findOne({ where: { id: messageId, conversationId } });
    if (!message) throw new NotFoundException('Message not found');
    const existing = await this.reactionRepo.findOne({ where: { messageId, userId } });
    if (existing) { await this.reactionRepo.remove(existing); return { reacted: false }; }
    const reaction = this.reactionRepo.create({ messageId, userId, emoji: data.emoji });
    await this.reactionRepo.save(reaction);
    return { reacted: true, emoji: data.emoji };
  }

  async markAsRead(userId: string, conversationId: string) {
    await this.partRepo.update({ conversationId, userId }, { unreadCount: 0, lastReadAt: new Date() });
    return { marked: true };
  }

  async sendTyping(userId: string, conversationId: string) {
    this.eventEmitter.emit('chat.typing', { conversationId, userId });
    return { typing: true };
  }

  async searchMessages(userId: string, query: string, conversationId?: string) {
    const qb = this.msgRepo.createQueryBuilder('m').where('m.content ILIKE :query', { query: `%${query}%` });
    if (conversationId) qb.andWhere('m.conversationId = :conversationId', { conversationId });
    const messages = await qb.orderBy('m.createdAt', 'DESC').take(50).getMany();
    return { messages };
  }

  async getSync(userId: string, since: number) {
    return { messages: [], conversations: [] };
  }
}
