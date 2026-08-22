import { IsString, IsIn } from 'class-validator';

export class ReactToMessageDto {
  @IsString() emoji: string;
  @IsString() @IsIn(['add', 'remove']) action: 'add' | 'remove';
}
