import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivatedAt1737647416424 implements MigrationInterface {
    name = 'AddActivatedAt1737647416424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" ADD "activated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "activated_at"`);
    }

}
