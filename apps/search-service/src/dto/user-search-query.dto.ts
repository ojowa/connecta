import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UserSearchQueryDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(18) @Max(100) ageMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(18) @Max(100) ageMax?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) maxDistance?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() @IsIn(['distance', 'compatibility', 'recent', 'popular']) sortBy?: string = 'distance';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
}