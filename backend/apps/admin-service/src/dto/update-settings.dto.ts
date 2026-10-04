import { IsOptional, IsBoolean, IsString, IsInt, Min, Max, IsObject } from 'class-validator';

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

  @IsOptional()
  @IsString()
  paymentPlatform?: string;

  @IsOptional()
  @IsObject()
  paystack?: {
    secretKey?: string;
    publicKey?: string;
    webhookSecret?: string;
  };

  @IsOptional()
  @IsObject()
  flutterwave?: {
    secretKey?: string;
    publicKey?: string;
    webhookSecret?: string;
  };

  @IsOptional()
  @IsString()
  storageProvider?: string;

  @IsOptional()
  @IsObject()
  storageLocal?: {
    uploadDir?: string;
    baseUrl?: string;
  };

  @IsOptional()
  @IsObject()
  storageS3?: {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    endpoint?: string;
  };

  @IsOptional()
  @IsObject()
  storageR2?: {
    accountId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    publicUrl?: string;
  };
}
