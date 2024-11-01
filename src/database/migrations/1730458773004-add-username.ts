import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsername1730458773004 implements MigrationInterface {
    name = 'AddUsername1730458773004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    }

}
