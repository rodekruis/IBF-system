import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { UserDecorator } from '../user/user.decorator';
import { CheckEapActionDto } from './dto/check-eap-action.dto';
import { AddEapActionsDto } from './dto/eap-action.dto';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapAction, EapActionsService } from './eap-actions.service';

@ApiBearerAuth()
@ApiTags('eap-actions')
@Controller('eap-actions')
export class EapActionsController {
  private readonly eapActionsService: EapActionsService;

  public constructor(eapActionsService: EapActionsService) {
    this.eapActionsService = eapActionsService;
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Add/update EAP-actions' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated EAP-actions.',
    type: [EapActionEntity],
  })
  @Post()
  public async addOrUpdateEapActions(
    @Body() eapActions: AddEapActionsDto,
  ): Promise<EapActionEntity[]> {
    return await this.eapActionsService.addOrUpdateEapActions(eapActions);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DisasterManager)
  @ApiOperation({ summary: 'Toggle status of EAP-action' })
  @ApiResponse({
    status: 201,
    description: 'Updated status of EAP-action.',
    type: EapActionStatusEntity,
  })
  @Post('check')
  public async checkAction(
    @UserDecorator('userId') userId: string,
    @Body() eapAction: CheckEapActionDto,
  ): Promise<EapActionStatusEntity> {
    return await this.eapActionsService.checkAction(userId, eapAction);
  }

  @ApiOperation({ summary: 'Check off early action from external Kobo-form' })
  @ApiResponse({
    status: 201,
    description: 'Checked off early action.',
    type: EapActionStatusEntity,
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @Post('check-external/:countryCodeISO3/:disasterType')
  public async checkActionExternally(
    @Param() params,
    @Body() eapActions: EapAction[],
  ): Promise<void> {
    return await this.eapActionsService.checkActionExternally(
      params.countryCodeISO3,
      params.disasterType as DisasterType,
      eapActions,
    );
  }
}
