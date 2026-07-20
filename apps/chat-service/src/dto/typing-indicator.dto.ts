import { IsBoolean } from 'class-validator';

export class TypingIndicatorDto {
  @IsBoolean() is_typing: boolean;
}
