import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToMoments1788003566779 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "moments" ADD COLUMN "deletedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "IDX_moments_deletedAt" ON "moments" ("deletedAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_moments_deletedAt"`);
        await queryRunner.query(`ALTER TABLE "moments" DROP COLUMN "deletedAt"`);
    }

}