import { IsOptional, IsString, IsIn } from 'class-validator';

export class LikeUserDto {
  @IsOptional() @IsString() @IsIn(['like', 'superlike']) likeType?: string = 'like';
}
