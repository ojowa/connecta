import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanFieldsAndSeedPlans1756400000000 implements MigrationInterface {
  name = 'AddPlanFieldsAndSeedPlans1756400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "tagline" varchar`);
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "isPopular" boolean NOT NULL DEFAULT false`);

    const count = await queryRunner.query(`SELECT COUNT(*)::int AS cnt FROM "plans"`);
    if (count[0].cnt === 0) {
      await queryRunner.query(`
        INSERT INTO "plans" ("name", "displayName", "description", "tagline", "isPopular", "priceMonthly", "priceYearly", "currency", "features", "dailyLikes", "dailySuperLikes", "isActive", "sortOrder")
        VALUES
        (
          'free', 'Free', 'Basic features to get started',
          'Start meeting new people today',
          false, 0, 0, 'NGN',
          '["10 likes per day","1 super like per day","Basic filters","Standard matching"]'::jsonb,
          10, 1, true, 1
        ),
        (
          'premium', 'Premium', 'Unlock more features and find your match faster',
          'Get noticed with premium features',
          true, 4999, 39999, 'NGN',
          '["Unlimited likes","5 super likes per day","See who liked you","Advanced filters","Priority in queue","No ads"]'::jsonb,
          999, 5, true, 2
        ),
        (
          'gold', 'Gold', 'The ultimate dating experience',
          'Everything you need to find the one',
          false, 9999, 79999, 'NGN',
          '["Unlimited likes","10 super likes per day","See who liked you","3 boosts per month","Travel mode","Read receipts","Profile boost","Priority support"]'::jsonb,
          999, 10, true, 3
        ),
        (
          'platinum', 'Platinum', 'For the serious dater who wants it all',
          'Your journey to love, amplified',
          false, 19999, 159999, 'NGN',
          '["Everything in Gold","Unlimited super likes","Unlimited boosts","Who liked you list","Incognito mode","Message before matching","Profile review by experts","Dedicated matchmaker"]'::jsonb,
          999, 999, true, 4
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "plans" WHERE "name" IN ('free', 'premium', 'gold', 'platinum')`);
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN IF EXISTS "isPopular"`);
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN IF EXISTS "tagline"`);
  }
}
