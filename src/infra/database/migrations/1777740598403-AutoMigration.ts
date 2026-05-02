import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1777740598403 implements MigrationInterface {
    name = 'AutoMigration1777740598403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_channel_enum" AS ENUM('Email', 'SMS', 'Push')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_priority_enum" AS ENUM('High', 'Medium', 'Low')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_status_enum" AS ENUM('pending', 'sent', 'failed')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" "public"."notification_channel_enum" NOT NULL, "recipient" character varying NOT NULL, "message" character varying NOT NULL, "priority" "public"."notification_priority_enum" NOT NULL, "data" jsonb, "status" "public"."notification_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_channel_enum"`);
    }

}
