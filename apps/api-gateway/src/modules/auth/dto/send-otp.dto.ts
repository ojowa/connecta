import { IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Must be E.164 format (e.g. +234...)' })
  phoneNumber: string;
}
