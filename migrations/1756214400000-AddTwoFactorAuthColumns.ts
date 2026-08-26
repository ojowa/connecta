import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwoFactorAuthColumns1756214400000 implements MigrationInterface {
  name = 'AddTwoFactorAuthColumns1756214400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorSecret" varchar`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorMethod" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "twoFactorMethod"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "twoFactorSecret"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "twoFactorEnabled"`);
  }
}
