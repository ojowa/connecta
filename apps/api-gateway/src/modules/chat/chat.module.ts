import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import {
  User, Profile, Conversation, ConversationParticipant,
  Message, MessageReaction, ReadReceipt, Notification, Photo,
} from '@app/common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Profile, Conversation, ConversationParticipant,
      Message, MessageReaction, ReadReceipt, Notification, Photo,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'connecta-dev-jwt-secret-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
