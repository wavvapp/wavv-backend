import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1727361409662 implements MigrationInterface {
    name = 'Sh1727361409662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone_verified"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "names" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "names"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phone_verified" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying NOT NULL`);
    }

}
