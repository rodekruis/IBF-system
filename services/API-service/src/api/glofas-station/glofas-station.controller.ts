import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { GlofasStationService } from './glofas-station.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('glofasStations')
@Controller('glofasStations')
export class GlofasStationController {
  private readonly glofasStationService: GlofasStationService;

  public constructor(glofasStationService: GlofasStationService) {
    this.glofasStationService = glofasStationService;
  }
}
