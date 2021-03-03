import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { EapActionsService } from './eap-actions.service';
import { UserDecorator } from '../user/user.decorator';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EapActionDto } from './dto/eap-action.dto';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { RolesGuard } from '../../roles.guard';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('eap-actions')
@Controller('eap-actions')
export class EapActionsController {
  private readonly eapActionsService: EapActionsService;

  public constructor(eapActionsService: EapActionsService) {
    this.eapActionsService = eapActionsService;
  }

  @ApiOperation({ summary: 'Check EAP actions as done' })
  @Post()
  public async checkAction(
    @UserDecorator('id') userId: string,
    @Body() eapAction: EapActionDto,
  ): Promise<EapActionStatusEntity> {
    return await this.eapActionsService.checkAction(userId, eapAction);
  }

  @ApiOperation({ summary: 'Get EAP actions and status' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiParam({ name: 'placeCode', required: true, type: 'string' })
  @Get('/:countryCode/:placeCode')
  public async getActionsWithStatus(
    @Param() params,
  ): Promise<EapActionEntity[]> {
    return await this.eapActionsService.getActionsWithStatus(
      params.countryCode,
      params.placeCode,
    );
  }

  @ApiOperation({ summary: 'Get areas of focus' })
  @Get('areas-of-focus')
  public async getAreasOfFocus(): Promise<AreaOfFocusEntity[]> {
    return await this.eapActionsService.getAreasOfFocus();
  }
}
