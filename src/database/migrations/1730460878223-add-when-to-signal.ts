import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhenToSignal1730460878223 implements MigrationInterface {
    name = 'AddWhenToSignal1730460878223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" ADD "when" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signal" DROP COLUMN "when"`);
    }

}
