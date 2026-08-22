import { IsString, IsNotEmpty } from 'class-validator';

export class BiometricLoginDto {
  @IsString()
  @IsNotEmpty()
  biometricId: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
