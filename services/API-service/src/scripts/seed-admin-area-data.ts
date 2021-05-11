import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminAreaDataEntity } from '../api/admin-area-data/admin-area-data.entity';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedAdminAreaData implements InterfaceScript {
    private connection: Connection;
    private readonly seedHelper: SeedHelper;
    private adminAreaDataRepository;

    public constructor(connection: Connection) {
        this.connection = connection;
        this.seedHelper = new SeedHelper(connection);
    }

    public async run(): Promise<void> {
        this.adminAreaDataRepository = this.connection.getRepository(
            AdminAreaDataEntity,
        );

        // PHL
        // vulnerability_dengue_data_ibfera_PHL
        const dengueVulnerabilityFilename = `./src/scripts/git-lfs/admin-area-data/vulnerability_dengue_data_ibfera_PHL.csv`;
        const dengueVulnerabilityData = await this.seedHelper.getCsvData(
            dengueVulnerabilityFilename,
        );

        await Promise.all(
            dengueVulnerabilityData.map(
                async (area): Promise<void> => {
                    return this.adminAreaDataRepository
                        .createQueryBuilder()
                        .insert()
                        .values({
                            countryCode: 'PHL',
                            adminLevel: 2,
                            placeCode: area['placeCode'],
                            key: area['key'],
                            value: area['value'],
                        })
                        .execute()
                        .catch(console.error);
                },
            ),
        );

        // UGA
        // Flood vulnerability
        const floodVulnerabilityFilename = `./src/scripts/git-lfs/admin-area-data/flood_vulnerability_UGA.csv`;
        const floodVulnerabilityData = await this.seedHelper.getCsvData(
            floodVulnerabilityFilename,
        );
        const floodVulnerabilityDataArray = floodVulnerabilityData.map(area => {
            return {
                countryCode: 'UGA',
                adminLevel: 2,
                placeCode: area['placeCode'],
                key: area['key'],
                value: area['value'],
            };
        });

        await this.adminAreaDataRepository.save(floodVulnerabilityDataArray);

        // COVID risk
        const covidRiskFilename = `./src/scripts/git-lfs/admin-area-data/covid_risk_UGA.csv`;
        const covidRiskData = await this.seedHelper.getCsvData(
            covidRiskFilename,
        );
        const covidRiskDataArray = covidRiskData.map(area => {
            return {
                countryCode: 'UGA',
                adminLevel: 2,
                placeCode: area['placeCode'],
                key: area['key'],
                value: area['value'],
            };
        });

        await this.adminAreaDataRepository.save(covidRiskDataArray);
    }
}

export default SeedAdminAreaData;
