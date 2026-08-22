import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UploadPhotoDto {
  @IsString() url: string;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
  @IsOptional() @IsString() caption?: string;
}
