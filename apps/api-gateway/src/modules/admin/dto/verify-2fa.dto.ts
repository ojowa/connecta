import { IsString, Length, Matches } from 'class-validator';

export class Verify2faDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: '2FA code must be 6 digits' })
  code: string;
}
