import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterBiometricDto {
  @IsString()
  @IsNotEmpty()
  biometricId: string;

  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @IsString()
  @IsNotEmpty()
  deviceName: string;
}
