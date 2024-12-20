import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSignalEndsAt1734705774201 implements MigrationInterface {
    name = 'AddSignalEndsAt1734705774201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" RENAME COLUMN "status" TO "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'Now()'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "ends_at" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "signal" RENAME COLUMN "ends_at" TO "status"`);
    }

}
