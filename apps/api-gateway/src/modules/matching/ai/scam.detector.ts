import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Conversation, ConversationParticipant } from '@app/common/entities';

export interface ScamAnalysis {
  riskScore: number;
  flags: string[];
  isScamSuspected: boolean;
}

const MONEY_PATTERNS = [
  /send\s+money/i,
  /wire\s+transfer/i,
  /western\s+union/i,
  /money\s+gram/i,
  /bitcoin/i,
  /crypto/i,
  /invest(ment)?/i,
  /opportunity/i,
  /bank\s+account/i,
  /swift\s+code/i,
  /gift\s+card/i,
  /steam\s+card/i,
  /itunes\s+card/i,
  /cash\s+app/i,
  /venmo/i,
  /zelle/i,
  /personal\s+account/i,
  /account\s+number/i,
  /routing\s+number/i,
  /naira/i,
  /dollar/i,
  /foreign\s+currency/i,
  /inheritance/i,
  /beneficiary/i,
  /next\s+of\s+kin/i,
];

const LOVE_BOMBING_PATTERNS = [
  /\blove\s+you\b/i,
  /\bmy\s+love\b/i,
  /\bsoul\s*mate\b/i,
  /\bdestiny\b/i,
  /\bmeant\s+to\s+be\b/i,
  /\bmarry\s+me\b/i,
  /\bforever\b/i,
  /\bcan't\s+live\s+without/i,
  /\blove\s+at\s+first\s+sight/i,
  /\bmy\s+heart\b/i,
];

const SOB_STORY_PATTERNS = [
  /\bemergency\b/i,
  /\bhospital\b/i,
  /\baccident\b/i,
  /\bstuck\b/i,
  /\bstranded\b/i,
  /\bneed\s+help\b/i,
  /\btrapped\b/i,
  /\bprison\b/i,
  /\barrested\b/i,
  /\bsick\b/i,
  /\bcancer\b/i,
  /\bdying\b/i,
  /\bfuneral\b/i,
  /\borphan\b/i,
  /\bwidow/i,
];

const URGENCY_PATTERNS = [
  /\bright\s+now\b/i,
  /\burgent\b/i,
  /\basap\b/i,
  /\bimmediately\b/i,
  /\btonight\b/i,
  /\bwithin\s+hours\b/i,
  /\btime\s+sensitive\b/i,
];

const EXTERNAL_LINK_PATTERN = /https?:\/\/[^\s]+/g;

@Injectable()
export class ScamDetector {
  constructor(
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private partRepo: Repository<ConversationParticipant>,
  ) {}

  async analyzeConversation(userId: string, targetUserId: string): Promise<ScamAnalysis> {
    const conversation = await this.findConversationBetween(userId, targetUserId);
    if (!conversation) return { riskScore: 0, flags: [], isScamSuspected: false };

    const messages = await this.msgRepo.find({
      where: { conversationId: conversation.id, isDeleted: false },
      order: { createdAt: 'ASC' },
      take: 200,
    });

    if (!messages.length) return { riskScore: 0, flags: [], isScamSuspected: false };

    const targetMessages = messages.filter((m) => m.senderId === targetUserId);
    if (!targetMessages.length) return { riskScore: 0, flags: [], isScamSuspected: false };

    return this.analyzeMessages(targetMessages, messages.length);
  }

  async analyzeMessages(
    messages: Message[],
    totalConversationLength: number,
  ): Promise<ScamAnalysis> {
    const flags: string[] = [];
    let riskScore = 0;

    const fullText = messages.map((m) => m.content || '').join(' ');

    const moneyMatches = MONEY_PATTERNS.filter((p) => p.test(fullText));
    if (moneyMatches.length > 0) {
      flags.push('money_mention');
      riskScore += 0.4;
    }

    // H5: Detect love bombing regardless of conversation length
    const loveBombCount = LOVE_BOMBING_PATTERNS.filter((p) => p.test(fullText)).length;
    if (loveBombCount >= 2) {
      flags.push('rapid_emotional_escalation');
      riskScore += 0.35;
    }

    const sobCount = SOB_STORY_PATTERNS.filter((p) => p.test(fullText)).length;
    if (sobCount >= 2) {
      flags.push('sob_story_pattern');
      riskScore += 0.25;
    }

    const urgencyCount = URGENCY_PATTERNS.filter((p) => p.test(fullText)).length;
    if (urgencyCount >= 2) {
      flags.push('high_urgency');
      riskScore += 0.2;
    }

    const urls = fullText.match(EXTERNAL_LINK_PATTERN) || [];
    if (urls.length > 0) {
      const suspiciousUrls = urls.filter((u) =>
        /bit\.ly|tinyurl|t\.co|shorturl|crypto|bitcoin|invest/i.test(u),
      );
      if (suspiciousUrls.length > 0) {
        flags.push('suspicious_links');
        riskScore += 0.3;
      } else {
        flags.push('external_links');
        riskScore += 0.1;
      }
    }

    if (messages.length > 5) {
      const avgLength =
        messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / messages.length;
      if (avgLength < 10 && messages.length > 10) {
        flags.push('generic_short_messages');
        riskScore += 0.1;
      }
    }

    const uniqueChars = new Set(fullText.replace(/\s/g, '')).size;
    if (fullText.length > 200 && uniqueChars < 15) {
      flags.push('low_message_diversity');
      riskScore += 0.1;
    }

    return {
      riskScore: Number(Math.min(riskScore, 1).toFixed(2)),
      flags,
      isScamSuspected: riskScore > 0.5,
    };
  }

  private async findConversationBetween(
    userId: string,
    targetUserId: string,
  ): Promise<Conversation | null> {
    const userParts = await this.partRepo.find({ where: { userId } });
    const targetParts = await this.partRepo.find({ where: { userId: targetUserId } });

    const userConvIds = new Set(userParts.map((p) => p.conversationId));
    const commonConv = targetParts.find((p) => userConvIds.has(p.conversationId));

    if (!commonConv) return null;
    return this.convRepo.findOne({ where: { id: commonConv.conversationId } });
  }
}