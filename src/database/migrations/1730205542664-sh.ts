import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1730205542664 implements MigrationInterface {
  name = "Sh1730205542664";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "friendship" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "friend_id" character varying NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_dbd6fb568cd912c5140307075cc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "friend_signal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "friendship_id" uuid, "signal_id" uuid, CONSTRAINT "PK_203f30fbdab0fbce4e22fbcbf4b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "signal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_bc7222a78e5bc0403a1988c1daf" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "names" character varying NOT NULL, "email" character varying NOT NULL, "phone_number" character varying, "location" character varying, "bio" character varying, "profile_picture_url" character varying, "password" character varying, "email_verified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "last_login" TIMESTAMP, "reset_password_token" character varying, "provider" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "friendship" ADD CONSTRAINT "FK_8885973a7c761a7f8fc0fc673f6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "friend_signal" ADD CONSTRAINT "FK_17c3c7a52d83a13d15d7cfa2fbe" FOREIGN KEY ("friendship_id") REFERENCES "friendship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "friend_signal" ADD CONSTRAINT "FK_d700855b9d35b6d48d5bc82f839" FOREIGN KEY ("signal_id") REFERENCES "signal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "signal" ADD CONSTRAINT "FK_93c838ea9d80c11d8b82d047b4d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signal" DROP CONSTRAINT "FK_93c838ea9d80c11d8b82d047b4d"`
    );
    await queryRunner.query(
      `ALTER TABLE "friend_signal" DROP CONSTRAINT "FK_d700855b9d35b6d48d5bc82f839"`
    );
    await queryRunner.query(
      `ALTER TABLE "friend_signal" DROP CONSTRAINT "FK_17c3c7a52d83a13d15d7cfa2fbe"`
    );
    await queryRunner.query(
      `ALTER TABLE "friendship" DROP CONSTRAINT "FK_8885973a7c761a7f8fc0fc673f6"`
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "signal"`);
    await queryRunner.query(`DROP TABLE "friend_signal"`);
    await queryRunner.query(`DROP TABLE "friendship"`);
  }
}
