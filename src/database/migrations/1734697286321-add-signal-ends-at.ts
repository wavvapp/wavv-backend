import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSignalEndsAt1734697286321 implements MigrationInterface {
    name = 'AddSignalEndsAt1734697286321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" RENAME COLUMN "status" TO "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "ends_at" TIME NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "ends_at" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "signal" RENAME COLUMN "ends_at" TO "status"`);
    }

}
