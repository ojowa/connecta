import { IsOptional, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  minAge?: number;

  @IsOptional()
  @IsInt()
  @Min(13)
  @Max(200)
  maxAge?: number;

  @IsOptional()
  @IsBoolean()
  enableVideoCalls?: boolean;

  @IsOptional()
  @IsBoolean()
  enableVoiceCalls?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSuperLikes?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxFreeSuperLikes?: number;
}
