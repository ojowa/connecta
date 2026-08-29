import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MatchingService } from '../matching.service';

@Injectable()
export class MomentCronService {
  private readonly logger = new Logger(MomentCronService.name);

  constructor(private readonly matchingService: MatchingService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredMoments() {
    try {
      const result = await this.matchingService.cleanupExpiredMoments();
      if (result.deleted > 0) {
        this.logger.log(`Cleaned up ${result.deleted} expired moments`);
      }
    } catch (e) {
      this.logger.error('Moment cleanup failed', e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldMoments() {
    try {
      const result = await this.matchingService.cleanupOldMoments();
      if (result.deleted > 0) {
        this.logger.log(`Cleaned up ${result.deleted} old moments (30+ days)`);
      }
    } catch (e) {
      this.logger.error('Old moment cleanup failed', e);
    }
  }
}