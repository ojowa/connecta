import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedFilterPreferences1756500000000 implements MigrationInterface {
  name = 'AddAdvancedFilterPreferences1756500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_preferences" ADD COLUMN "relationshipGoal" varchar NOT NULL DEFAULT 'any'
    `);
    await queryRunner.query(`
      ALTER TABLE "user_preferences" ADD COLUMN "minHeight" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "user_preferences" ADD COLUMN "maxHeight" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "user_preferences" ADD COLUMN "educationLevel" varchar NOT NULL DEFAULT 'any'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "educationLevel"`);
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "maxHeight"`);
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "minHeight"`);
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "relationshipGoal"`);
  }
}
