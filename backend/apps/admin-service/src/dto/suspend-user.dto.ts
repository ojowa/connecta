import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class SuspendUserDto {
  @IsString()
  @IsIn(['spam', 'fake', 'inappropriate', 'harassment', 'other'])
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  durationDays?: number;
}
