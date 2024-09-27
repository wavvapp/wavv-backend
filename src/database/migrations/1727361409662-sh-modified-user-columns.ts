import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedUserColumnsSh1727361409662 implements MigrationInterface {
  name = "ModifiedUserColumnsSh1727361409662";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone_verified"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "names" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "phone_number" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "location" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "bio" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "profile_picture_url" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "is_active" SET DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "last_login" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "names"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "phone_verified" boolean NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "name" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "last_login" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "is_active" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "email_verified" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "profile_picture_url" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "bio" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "location" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "phone_number" SET NOT NULL`
    );
  }
}
