import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationCode1737361108216 implements MigrationInterface {
  name = "AddVerificationCode1737361108216";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "verification_code" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_d8220152c7aaaa6e108289ce10d" UNIQUE ("verification_code")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_d8220152c7aaaa6e108289ce10d"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "verification_code"`
    );
  }
}
