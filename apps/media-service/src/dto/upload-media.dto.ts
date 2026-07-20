import { IsString, IsOptional, IsIn } from 'class-validator';

export class UploadMediaDto {
  @IsString() filename: string;
  @IsOptional() @IsString() @IsIn(['image', 'video', 'audio']) mediaType?: string = 'image';
  @IsOptional() @IsString() caption?: string;
}