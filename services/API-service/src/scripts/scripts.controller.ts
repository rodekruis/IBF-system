import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Connection } from 'typeorm';
import { SeedInit } from './seed-init';

class ResetDto {
  @ApiModelProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
}

@Controller('scripts')
export class ScriptsController {
  public constructor(private connection: Connection) {}

  @ApiOperation({ title: 'Reset database' })
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
}
