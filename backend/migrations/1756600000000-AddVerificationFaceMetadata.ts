import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationFaceMetadata1756600000000 implements MigrationInterface {
  name = 'AddVerificationFaceMetadata1756600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "verification_requests"
      ADD COLUMN IF NOT EXISTS "faceWidth" integer,
      ADD COLUMN IF NOT EXISTS "faceHeight" integer,
      ADD COLUMN IF NOT EXISTS "faceConfidence" decimal(5,4),
      ADD COLUMN IF NOT EXISTS "livenessScore" decimal(5,4),
      ADD COLUMN IF NOT EXISTS "imageWidth" integer,
      ADD COLUMN IF NOT EXISTS "imageHeight" integer,
      ADD COLUMN IF NOT EXISTS "fileSize" integer,
      ADD COLUMN IF NOT EXISTS "reviewedBy" varchar,
      ADD COLUMN IF NOT EXISTS "faceLandmarks" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "verification_requests"
      DROP COLUMN "faceWidth",
      DROP COLUMN "faceHeight",
      DROP COLUMN "faceConfidence",
      DROP COLUMN "livenessScore",
      DROP COLUMN "imageWidth",
      DROP COLUMN "imageHeight",
      DROP COLUMN "fileSize",
      DROP COLUMN "reviewedBy",
      DROP COLUMN "faceLandmarks"
    `);
  }
}
