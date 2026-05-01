import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1777672323048 implements MigrationInterface {
    name = 'AutoMigration1777672323048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'Default'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
