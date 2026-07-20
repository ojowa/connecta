import { IsOptional, IsString, IsIn, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditLogQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 50;
  @IsOptional() @IsString() @IsIn(['auth', 'matching', 'chat', 'admin', 'all']) filter?: string = 'all';
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() userId?: string;
}
