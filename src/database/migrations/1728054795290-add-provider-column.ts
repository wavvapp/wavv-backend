import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderColumn1728054795290 implements MigrationInterface {
    name = 'AddProviderColumn1728054795290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "reset_password_token_expires_at" TO "provider"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "provider" TO "reset_password_token_expires_at"`);
    }

}
