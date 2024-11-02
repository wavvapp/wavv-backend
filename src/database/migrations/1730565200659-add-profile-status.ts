import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileStatus1730565200659 implements MigrationInterface {
    name = 'AddProfileStatus1730565200659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_status" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_status"`);
    }

}
