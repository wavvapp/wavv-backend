import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFriendsGroups1741276759809 implements MigrationInterface {
    name = 'AddFriendsGroups1741276759809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "owner_id" uuid, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_friendship_groups" ("groups_id" uuid NOT NULL, "friendship_id" uuid NOT NULL, CONSTRAINT "PK_2f6a772a20fb328cfb40f09e072" PRIMARY KEY ("groups_id", "friendship_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_022d02d0a49a8d07e5563e7fac" ON "user_friendship_groups" ("groups_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_61f37b31af0c0e792dc8a492d1" ON "user_friendship_groups" ("friendship_id") `);
        await queryRunner.query(`ALTER TABLE "friendship" ADD "groups_id" uuid`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_5d7af25843377def343ab0beaa8" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_874f62fa8300ea8d196ce284a6a" FOREIGN KEY ("groups_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friendship_groups" ADD CONSTRAINT "FK_022d02d0a49a8d07e5563e7facb" FOREIGN KEY ("groups_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_friendship_groups" ADD CONSTRAINT "FK_61f37b31af0c0e792dc8a492d1d" FOREIGN KEY ("friendship_id") REFERENCES "friendship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friendship_groups" DROP CONSTRAINT "FK_61f37b31af0c0e792dc8a492d1d"`);
        await queryRunner.query(`ALTER TABLE "user_friendship_groups" DROP CONSTRAINT "FK_022d02d0a49a8d07e5563e7facb"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_874f62fa8300ea8d196ce284a6a"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_5d7af25843377def343ab0beaa8"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP COLUMN "groups_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61f37b31af0c0e792dc8a492d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_022d02d0a49a8d07e5563e7fac"`);
        await queryRunner.query(`DROP TABLE "user_friendship_groups"`);
        await queryRunner.query(`DROP TABLE "groups"`);
    }

}
