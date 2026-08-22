import { IsString, IsOptional, IsIn, MaxLength, IsBoolean } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsIn(['spam', 'fake', 'inappropriate', 'harassment', 'fraud', 'other'])
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  permanent?: boolean = false;
}
