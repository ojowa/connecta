import { IsArray, IsString, IsOptional, IsIn } from 'class-validator';

export class MarkNotificationsReadDto {
  @IsOptional() @IsArray() @IsString({ each: true }) notificationIds?: string[];
  @IsOptional() @IsString() @IsIn(['all', 'single']) markAs?: string = 'all';
}
