import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
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
