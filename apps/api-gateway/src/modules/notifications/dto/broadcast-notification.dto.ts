import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, IsIn } from 'class-validator';

export class BroadcastNotificationDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() @MaxLength(1000) body: string;
  @IsOptional() @IsString() @IsIn(['info', 'warning', 'promotion']) type?: string = 'info';
  @IsOptional() @IsArray() @IsString({ each: true }) targetUserIds?: string[];
  @IsOptional() @IsString() targetAudience?: string;
}
