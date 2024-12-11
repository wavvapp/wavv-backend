import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAuthId1733939196336 implements MigrationInterface {
    name = 'AddUserAuthId1733939196336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "auth_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "auth_id"`);
    }

}
