import { IsString, IsOptional, MaxLength } from 'class-validator';

export class RequestRefundDto {
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
}
