import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhenAndMessageToSignal1730465601235 implements MigrationInterface {
    name = 'AddWhenAndMessageToSignal1730465601235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" ADD "when" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "signal" ADD "status_message" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "status_message"`);
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "when"`);
    }

}
