import { IsString, IsOptional, MinLength, MaxLength, IsEmail, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(50) displayName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(128) password?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() @MaxLength(500) bio?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() @MaxLength(100) occupation?: string;
  @IsOptional() @IsString() @MaxLength(200) education?: string;
}
