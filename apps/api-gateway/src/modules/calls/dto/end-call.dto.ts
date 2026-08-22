import { IsString, IsOptional, IsIn } from 'class-validator';

export class EndCallDto {
  @IsOptional()
  @IsString()
  @IsIn(['normal', 'network_issue', 'timeout'])
  reason?: string;
}
