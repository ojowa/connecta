import { IsOptional, IsInt, Min, Max, IsString, IsArray } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional() @IsInt() @Min(18) @Max(100) ageMin?: number;
  @IsOptional() @IsInt() @Min(18) @Max(100) ageMax?: number;
  @IsOptional() @IsInt() @Min(1) @Max(500) maxDistanceKm?: number;
  @IsOptional() @IsString() genderPreference?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) interests?: string[];
  @IsOptional() @IsString() lookingFor?: string;
}
