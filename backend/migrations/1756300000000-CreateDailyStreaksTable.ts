import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyStreaksTable1756300000000 implements MigrationInterface {
  name = 'CreateDailyStreaksTable1756300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "daily_streaks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "currentStreak" integer NOT NULL DEFAULT 0,
        "longestStreak" integer NOT NULL DEFAULT 0,
        "lastCheckInAt" timestamp,
        "totalCheckIns" integer NOT NULL DEFAULT 0,
        "claimedRewards" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_daily_streaks_userId" UNIQUE ("userId")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_daily_streaks_userId" ON "daily_streaks" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "daily_streaks"`);
  }
}
