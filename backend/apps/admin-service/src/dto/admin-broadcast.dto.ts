import { IsString, IsNotEmpty, IsOptional, MaxLength, IsIn, IsArray } from 'class-validator';

export class AdminBroadcastDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @IsIn(['info', 'warning', 'critical'])
  type?: string = 'info';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetUserIds?: string[];

  @IsOptional()
  @IsString()
  targetAudience?: string;
}
