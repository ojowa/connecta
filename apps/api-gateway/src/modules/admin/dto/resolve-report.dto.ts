import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

export class ResolveReportDto {
  @IsString()
  @IsIn(['resolved', 'dismissed', 'escalated'])
  resolution: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionTaken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
