import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class UpdateNotificationPrefsDto {
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @IsOptional() @IsBoolean() matchNotifications?: boolean;
  @IsOptional() @IsBoolean() messageNotifications?: boolean;
  @IsOptional() @IsBoolean() likeNotifications?: boolean;
  @IsOptional() @IsBoolean() systemNotifications?: boolean;
  @IsOptional() @IsString() @IsIn(['all', 'important', 'none']) quietHours?: string;
  @IsOptional() @IsString() quietHoursStart?: string;
  @IsOptional() @IsString() quietHoursEnd?: string;
}
