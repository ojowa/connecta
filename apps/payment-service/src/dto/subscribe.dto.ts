import { IsString, IsOptional, IsIn } from 'class-validator';

export class SubscribeDto {
  @IsString() planId: string;
  @IsOptional() @IsString() @IsIn(['monthly', 'quarterly', 'annual']) billingCycle?: string = 'monthly';
  @IsOptional() @IsString() promoCode?: string;
}
