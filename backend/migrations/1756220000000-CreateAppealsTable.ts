import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppealsTable1756220000000 implements MigrationInterface {
  name = 'CreateAppealsTable1756220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appeals" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "reason" varchar NOT NULL,
        "description" varchar,
        "evidenceUrls" text[],
        "status" varchar NOT NULL DEFAULT 'pending',
        "reviewedBy" varchar,
        "decision" varchar,
        "decisionNotes" varchar,
        "reviewedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_appeals_userId" ON "appeals" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_appeals_status" ON "appeals" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "appeals"`);
  }
}
