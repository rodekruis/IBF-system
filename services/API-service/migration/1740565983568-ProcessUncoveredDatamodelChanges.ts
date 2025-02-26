import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProcessUncoveredDatamodelChanges1740565983568
  implements MigrationInterface
{
  name = 'ProcessUncoveredDatamodelChanges1740565983568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_3cae353eb56d44a19f3528a59b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_d7bde05c87df7b533a1c4b783ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_dcdd92b565690f3fa5cb684a050" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_495a2dc210c1d7302e60d800c6d" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_495a2dc210c1d7302e60d800c6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_dcdd92b565690f3fa5cb684a050"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_d7bde05c87df7b533a1c4b783ac" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_3cae353eb56d44a19f3528a59b2" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
