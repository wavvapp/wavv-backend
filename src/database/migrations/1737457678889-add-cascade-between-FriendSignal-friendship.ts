import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeBetweenFriendSignalFriendship1737457678889 implements MigrationInterface {
    name = 'AddCascadeBetweenFriendSignalFriendship1737457678889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friend_signal" DROP CONSTRAINT "FK_17c3c7a52d83a13d15d7cfa2fbe"`);
        await queryRunner.query(`ALTER TABLE "friend_signal" ADD CONSTRAINT "FK_17c3c7a52d83a13d15d7cfa2fbe" FOREIGN KEY ("friendship_id") REFERENCES "friendship"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friend_signal" DROP CONSTRAINT "FK_17c3c7a52d83a13d15d7cfa2fbe"`);
        await queryRunner.query(`ALTER TABLE "friend_signal" ADD CONSTRAINT "FK_17c3c7a52d83a13d15d7cfa2fbe" FOREIGN KEY ("friendship_id") REFERENCES "friendship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
