import { MigrationInterface, QueryRunner } from "typeorm";

export class UseUtcEndsAt1737640468658 implements MigrationInterface {
    name = 'UseUtcEndsAt1737640468658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "ends_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "ends_at"`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

}
