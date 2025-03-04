import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstaintFriendship1741101595253 implements MigrationInterface {
    name = 'AddUniqueConstaintFriendship1741101595253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "UQ_8ad5e55bcae38d0bca5cd7d0b38" UNIQUE ("user_id", "friend_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "UQ_8ad5e55bcae38d0bca5cd7d0b38"`);
    }

}
