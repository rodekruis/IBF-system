import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class RenameMockRasters1710512991479 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const directoryPath = './geoserver-volume/raster-files/mock-output/';
    const ugandaFloodsBasicPath = `${directoryPath}/flood_extent_day_UGA.tif`;
    if (fs.existsSync(ugandaFloodsBasicPath)) {
      // Do not run the migration another time if it has already been run on test servers
      return;
    }

    if (fs.existsSync(directoryPath)) {
      const files = fs.readdirSync(directoryPath);
      files.forEach((file) => {
        if (!file.includes('hour_MWI')) {
          const newFilename = file.replace(
            /_[0-9]+-(hour|day|month)_/g,
            '_$1_',
          );
          fs.renameSync(
            path.join(directoryPath, file),
            path.join(directoryPath, newFilename),
          );
        }
      });
    } else {
      console.log(`Directory ${directoryPath} does not exist`);
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // If you want to revert the renaming, you would need to implement the logic here
  }
}
