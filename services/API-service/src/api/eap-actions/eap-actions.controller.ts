import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { EapActionsService } from './eap-actions.service';
import { UserDecorator } from '../user/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CheckEapActionDto } from './dto/check-eap-action.dto';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { RolesGuard } from '../../roles.guard';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';
import { EapActionEntity } from './eap-action.entity';
import { AddEapActionsDto } from './dto/eap-action.dto';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('eap-actions')
@Controller('eap-actions')
export class EapActionsController {
  private readonly eapActionsService: EapActionsService;

  public constructor(eapActionsService: EapActionsService) {
    this.eapActionsService = eapActionsService;
  }

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

  @ApiOperation({ summary: 'Get Areas of Focus (categories of EAP-actions)' })
  @ApiResponse({
    status: 200,
    description: 'Areas of focus.',
    type: [AreaOfFocusEntity],
  })
  @Get('areas-of-focus')
  public async getAreasOfFocus(): Promise<AreaOfFocusEntity[]> {
    return await this.eapActionsService.getAreasOfFocus();
  }
}
