import { IsString, IsIn } from 'class-validator';

export class UpgradePlanDto {
  @IsString() newPlanId: string;
  @IsString() @IsIn(['monthly', 'quarterly', 'annual']) billingCycle: string;
}
