import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFriendRelationship1730988402587 implements MigrationInterface {
    name = 'AddFriendRelationship1730988402587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" DROP COLUMN "friend_id"`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD "friend_id" uuid`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_8cadaad5534dd8b4827f05968ef" FOREIGN KEY ("friend_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_8cadaad5534dd8b4827f05968ef"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP COLUMN "friend_id"`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD "friend_id" character varying NOT NULL`);
    }

}
