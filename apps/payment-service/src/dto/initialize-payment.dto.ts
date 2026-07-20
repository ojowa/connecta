import { IsString, IsOptional, IsIn } from 'class-validator';

export class InitializePaymentDto {
  @IsString() amount: string;
  @IsString() @IsIn(['NGN', 'USD', 'GBP', 'KES', 'GHS']) currency: string;
  @IsString() @IsIn(['subscription', 'superlike', 'boost', 'wallet_topup']) purpose: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() planId?: string;
}
