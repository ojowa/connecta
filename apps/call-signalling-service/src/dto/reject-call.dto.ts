import { IsString, IsOptional, IsIn } from 'class-validator';

export class RejectCallDto {
  @IsOptional()
  @IsString()
  @IsIn(['busy', 'declined', 'no_answer', 'network_issue'])
  reason?: string;
}
