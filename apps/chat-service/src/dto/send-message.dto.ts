import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class SendMessageDto {
  @IsString() @MaxLength(5000) content: string;
  @IsOptional() @IsString() @IsIn(['text', 'image', 'voice', 'gif', 'sticker']) messageType?: string = 'text';
  @IsOptional() @IsString() encryptedContent?: string;
  @IsOptional() @IsString() @MaxLength(200) imageUrl?: string;
}
