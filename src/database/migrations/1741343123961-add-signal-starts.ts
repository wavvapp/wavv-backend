import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSignalStarts1741343123961 implements MigrationInterface {
    name = 'AddSignalStarts1741343123961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" ADD "starts_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "starts_at"`);
    }

}
