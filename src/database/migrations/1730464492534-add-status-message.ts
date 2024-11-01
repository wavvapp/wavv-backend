import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusMessage1730464492534 implements MigrationInterface {
    name = 'AddStatusMessage1730464492534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" ADD "status_message" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "status_message"`);
    }

}
