import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['24h', '7d', '30d', '90d', '1y'])
  period?: string = '7d';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  metric?: string;
}
