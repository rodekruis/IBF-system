import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { UserRole } from '../api/user/user-role.enum';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import { SeedInit } from './seed-init';

class ResetDto {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
}

@Controller('scripts')
@ApiTags('--- mock/seed data ---')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ScriptsController {
  public constructor(private seedInit: SeedInit) {}

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Reset database with original seed data' })
  @ApiResponse({
    status: 202,
    description: 'Database reset with original seed data.',
  })
  @Post('/reset')
  public async resetDb(@Body() body: ResetDto, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    await this.seedInit.run();
    return res
      .status(HttpStatus.ACCEPTED)
      .send('Database reset with original seed data.');
  }
}
