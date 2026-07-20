import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  VOICE_NOTE = 'voice_note',
  GIF = 'gif',
  SYSTEM = 'system',
}

export class SendMessageDto {
  @ApiProperty({ example: 'uuid-of-conversation' })
  @IsUUID()
  conversationId: string;

  @ApiProperty({ example: 'Hello! How are you?' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  replyToMessageId?: string;
}

export class GetConversationsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}

export class GetMessagesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  before?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  after?: string;
}

export class MarkReadDto {
  @ApiProperty()
  @IsUUID()
  conversationId: string;

  @ApiProperty()
  @IsUUID()
  lastMessageId: string;
}

export class CreateConversationDto {
  @ApiProperty({ example: 'uuid-of-other-user' })
  @IsUUID()
  participantId: string;
}
