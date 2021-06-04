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
  @IsIn(['PHL', 'UGA'])
  public readonly countryCodeISO3: string;
  @ApiProperty()
  @IsNotEmpty()
  public readonly triggered: boolean;
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

    const result = await this.scriptsService.mockCountry(body);

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
