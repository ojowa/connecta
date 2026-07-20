import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class StartCallDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsIn(['voice', 'video'])
  callType: string;
}
