import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationFaceMetadata1756600000000 implements MigrationInterface {
  name = 'AddVerificationFaceMetadata1756600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "verification_requests"
      ADD COLUMN "faceWidth" integer,
      ADD COLUMN "faceHeight" integer,
      ADD COLUMN "faceConfidence" decimal(5,4),
      ADD COLUMN "livenessScore" decimal(5,4),
      ADD COLUMN "imageWidth" integer,
      ADD COLUMN "imageHeight" integer,
      ADD COLUMN "fileSize" integer,
      ADD COLUMN "reviewedBy" varchar,
      ADD COLUMN "faceLandmarks" jsonb
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
