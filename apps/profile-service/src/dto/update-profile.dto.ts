import { IsString, IsOptional, MaxLength, IsArray, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(500) bio?: string;
  @IsOptional() @IsString() @MaxLength(100) occupation?: string;
  @IsOptional() @IsString() @MaxLength(200) education?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) interests?: string[];
  @IsOptional() @IsString() relationshipGoal?: string;
  @IsOptional() @IsString() height?: string;
  @IsOptional() @IsString() ethnicity?: string;
  @IsOptional() @IsString() religion?: string;
  @IsOptional() @IsString() zodiacSign?: string;
  @IsOptional() @IsString() languages?: string;
  @IsOptional() @IsString() @MaxLength(200) hometown?: string;
  @IsOptional() @IsBoolean() showDistance?: boolean;
  @IsOptional() @IsBoolean() showOnlineStatus?: boolean;
}
