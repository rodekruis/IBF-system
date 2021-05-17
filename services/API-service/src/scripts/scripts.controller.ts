import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { ExposureUnit } from './../api/admin-area-dynamic-data/enum/exposure-unit';
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { Connection } from 'typeorm';
import { SeedInit } from './seed-init';
import countries from './json/countries.json';
import exposure from '../api/admin-area-dynamic-data/dto/example/upload-exposure-example.json';
import exposureTriggered from '../api/admin-area-dynamic-data/dto/example/upload-exposure-example-triggered.json';
import { ExposurePlaceCodeDto } from 'src/api/admin-area-dynamic-data/dto/exposure-place-code.dto';

class ResetDto {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
}

class MockDynamic {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
  @ApiProperty({ example: 'PHL' })
  @IsIn(['PHL'])
  public readonly countryCodeISO3: string;
  @ApiProperty()
  @IsNotEmpty()
  public readonly triggered: boolean;
}

@Controller('scripts')
export class ScriptsController {
  private connection: Connection;

  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;

  public constructor(
    connection: Connection,
    adminAreaDynamicDataService: AdminAreaDynamicDataService,
  ) {
    this.connection = connection;
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
  }

  @ApiOperation({ summary: 'Reset database' })
  @Post('/reset')
  public async resetDb(@Body() body: ResetDto, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    let seed;
    seed = new SeedInit(this.connection);
    await seed.run();
    return res
      .status(HttpStatus.ACCEPTED)
      .send('Request received. The reset can take a minute.');
  }

  @ApiOperation({ summary: 'Mock dynamic data' })
  @Post('/mock-dynamic-data')
  public async mockDynamic(
    @Body() body: MockDynamic,
    @Res() res,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    const selectedCountry = countries.find((country): any => {
      if (body.countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    });
    const exposureUnitsPHL = [
      ExposureUnit.population,
      ExposureUnit.potentialCases65,
      ExposureUnit.potentialCasesU9,
      ExposureUnit.alertThreshold,
    ];
    for (const unit of exposureUnitsPHL) {
      for (const activeLeadTime of selectedCountry.countryActiveLeadTimes) {
        console.log(
          `Seeding leadtime: ${activeLeadTime} unit: ${unit} for country: ${selectedCountry.countryCodeISO3}`,
        );
        await this.adminAreaDynamicDataService.exposure({
          countryCodeISO3: body.countryCodeISO3,
          exposurePlaceCodes: this.mockAmount(
            body.triggered ? exposureTriggered : exposure,
            unit,
          ),
          leadTime: activeLeadTime as LeadTime,
          exposureUnit: unit,
          adminLevel: selectedCountry.defaultAdminLevel,
        });
      }
    }

    return res.status(HttpStatus.ACCEPTED).send('Succesfully mocked!');
  }

  private mockAmount(
    exposurePlacecodes: any,
    exposureUnit: ExposureUnit,
  ): ExposurePlaceCodeDto[] {
    const copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlacecodes));
    for (const pcodeData of copyOfExposureUnit) {
      if (exposureUnit === ExposureUnit.potentialCases65) {
        pcodeData.amount = Math.round(pcodeData.amount * 0.1);
      } else if (exposureUnit === ExposureUnit.potentialCasesU9) {
        pcodeData.amount = Math.round(pcodeData.amount * 0.2);
      } else if (exposureUnit === ExposureUnit.alertThreshold) {
        pcodeData.amount = Number(pcodeData.amount > 0);
      }
    }
    return copyOfExposureUnit;
  }
}
