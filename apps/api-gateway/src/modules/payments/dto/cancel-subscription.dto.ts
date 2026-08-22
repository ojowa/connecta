import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
  @IsString() @IsIn(['too_expensive', 'not_using', 'found_match', 'other']) reason: string;
  @IsOptional() @IsString() @MaxLength(500) feedback?: string;
}
