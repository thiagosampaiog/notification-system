import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1777651557861 implements MigrationInterface {
    name = 'AutoMigration1777651557861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "update_at" TO "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updated_at" TO "update_at"`);
    }

}
