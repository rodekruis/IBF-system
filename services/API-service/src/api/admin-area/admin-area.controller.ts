import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { AdminAreaEntity } from './admin-area.entity';
import { AdminAreaService } from './admin-area.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('adminAreas')
@Controller('adminAreas')
export class AdminAreaController {
  private readonly adminAreaService: AdminAreaService;

  public constructor(adminAreaService: AdminAreaService) {
    this.adminAreaService = adminAreaService;
  }
}
