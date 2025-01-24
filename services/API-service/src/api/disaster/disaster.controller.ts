import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';
import { DisasterService } from './disaster.service';
import { AddDisastersDto } from './dto/add-disaster.dto';

@ApiBearerAuth()
@ApiTags('country')
@Controller('country')
export class DisasterController {
  public constructor(private readonly disasterService: DisasterService) {}

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) country' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated country-properties.',
  })
  @Post()
  public async addOrUpdateCountries(
    @Body() disasters: AddDisastersDto,
  ): Promise<void> {
    await this.disasterService.addOrUpdateDisasters(disasters);
  }
}
