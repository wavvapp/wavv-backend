import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFriendship1739128013832 implements MigrationInterface {
    name = 'AddFriendship1739128013832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" ADD "has_notification_enabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" DROP COLUMN "has_notification_enabled"`);
    }

}
