import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Connection } from 'typeorm';
import { SeedInit } from './seed-init';
import { ScriptsService } from './scripts.service';
import { RolesGuard } from '../roles.guard';
import { DisasterType } from '../api/disaster/disaster-type.enum';

class ResetDto {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
}

export class MockDynamic {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
  @ApiProperty({ example: 'UGA' })
  @IsIn(['PHL', 'UGA', 'ZMB', 'ETH', 'ZWE'])
  public readonly countryCodeISO3: string;
  @ApiProperty({ example: DisasterType.Floods })
  @IsIn([
    DisasterType.Floods,
    DisasterType.Dengue,
    DisasterType.Malaria,
    DisasterType.Drought,
  ])
  public readonly disasterType: DisasterType;
  @ApiProperty()
  @IsNotEmpty()
  public readonly triggered: boolean;
  @ApiProperty({ example: true })
  @IsNotEmpty()
  public readonly removeEvents: boolean;
}

@Controller('scripts')
@ApiTags('scripts')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ScriptsController {
  private connection: Connection;

  private readonly scriptsService: ScriptsService;

  public constructor(connection: Connection, scriptsService: ScriptsService) {
    this.connection = connection;
    this.scriptsService = scriptsService;
  }

  @ApiOperation({ summary: 'Reset database' })
  @Post('/reset')
  public async resetDb(@Body() body: ResetDto, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const seed = new SeedInit(this.connection);
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

    const result = await this.scriptsService.mockCountry(body);

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
