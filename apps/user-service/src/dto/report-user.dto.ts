import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

export class ReportUserDto {
  @IsString() @IsIn(['spam', 'fake', 'inappropriate', 'harassment', 'other']) reason: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
}
