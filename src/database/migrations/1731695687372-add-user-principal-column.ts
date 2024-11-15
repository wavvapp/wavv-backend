import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPrincipalColumn1731695687372 implements MigrationInterface {
    name = 'AddUserPrincipalColumn1731695687372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "principal" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "principal"`);
    }

}
