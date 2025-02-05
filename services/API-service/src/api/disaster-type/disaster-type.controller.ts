import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';
import { DisasterTypeService } from './disaster-type.service';
import { AddDisasterTypesDto } from './dto/add-disaster-type.dto';

@ApiBearerAuth()
@ApiTags('disaster-type')
@Controller('disaster-type')
export class DisasterTypeController {
  public constructor(
    private readonly disasterTypeService: DisasterTypeService,
  ) {}

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) disasterTypes' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or updated disasterType-properties.',
  })
  @Post()
  public async addOrUpdateDisasterTypes(
    @Body() disasterTypes: AddDisasterTypesDto,
  ): Promise<void> {
    await this.disasterTypeService.addOrUpdateDisasterTypes(disasterTypes);
  }
}
