import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, User, Profile, Notification, AuditLog } from '@app/common/entities';
import { UserStatus } from '@app/common/entities/user.entity';
import { MODERATION_EVENTS } from '@app/common/constants/events';

@Injectable()
export class ModerationEventsHandler {
  private readonly logger = new Logger('ModerationEventsHandler');

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async handleContentReported(payload: { reportId: string; reporterId: string; reportedId: string; reason: string }) {
    this.logger.log(`Handling content.reported: ${payload.reportId}`);

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        adminId: payload.reporterId,
        action: 'report_created',
        targetType: 'report',
        targetId: payload.reportId,
        details: { reportedId: payload.reportedId, reason: payload.reason },
      }),
    );

    const reportCount = await this.reportRepository.count({
      where: { reportedId: payload.reportedId, status: 'pending' },
    });

    if (reportCount >= 3) {
      await this.userRepository.update(payload.reportedId, { status: UserStatus.SUSPENDED });

      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: payload.reportedId,
          type: 'system',
          title: 'Account Under Review',
          body: 'Your account has been temporarily suspended due to multiple reports.',
          status: 'sent',
          sentAt: new Date(),
        }),
      );
    }
  }

  async handleContentReviewed(payload: { reportId: string; reviewedBy: string; actionTaken: string }) {
    this.logger.log(`Handling content.reviewed: ${payload.reportId}`);

    await this.reportRepository.update(payload.reportId, {
      status: 'reviewed',
      reviewedBy: payload.reviewedBy,
      actionTaken: payload.actionTaken,
    });

    const report = await this.reportRepository.findOne({
      where: { id: payload.reportId },
    });

    if (report) {
      await this.auditLogRepository.save(
        this.auditLogRepository.create({
          adminId: payload.reviewedBy,
          action: 'report_reviewed',
          targetType: 'report',
          targetId: payload.reportId,
          details: { actionTaken: payload.actionTaken },
        }),
      );
    }
  }

  async handleUserWarned(payload: { userId: string; reason: string }) {
    this.logger.log(`Handling user.warned: ${payload.userId}`);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: 'Account Warning',
        body: `Your account has been warned. Reason: ${payload.reason}. Continued violations may result in suspension.`,
        status: 'sent',
        sentAt: new Date(),
      }),
    );

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        adminId: 'system',
        action: 'user_warned',
        targetType: 'user',
        targetId: payload.userId,
        details: { reason: payload.reason },
      }),
    );
  }

  async handleUserSuspended(payload: { userId: string; reason: string }) {
    this.logger.log(`Handling user.suspended: ${payload.userId}`);

    await this.userRepository.update(payload.userId, { status: UserStatus.SUSPENDED });
    await this.profileRepository.update({ userId: payload.userId }, { isActive: false });

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: payload.userId,
        type: 'system',
        title: 'Account Suspended',
        body: `Your account has been suspended. Reason: ${payload.reason}`,
        status: 'sent',
        sentAt: new Date(),
      }),
    );

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        adminId: 'system',
        action: 'user_suspended',
        targetType: 'user',
        targetId: payload.userId,
        details: { reason: payload.reason },
      }),
    );
  }
}
