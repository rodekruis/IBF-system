import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { EapActionsService } from './eap-actions.service';
import { UserDecorator } from '../user/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EapActionDto } from './dto/eap-action.dto';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { RolesGuard } from '../../roles.guard';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('eap-actions')
@Controller('eap-actions')
export class EapActionsController {
  private readonly eapActionsService: EapActionsService;

  public constructor(eapActionsService: EapActionsService) {
    this.eapActionsService = eapActionsService;
  }

  @Roles(UserRole.DisasterManager)
  @ApiOperation({ summary: 'Toggle status of EAP-action' })
  @ApiResponse({
    status: 201,
    description: 'Updated status of EAP-action.',
    type: EapActionStatusEntity,
  })
  @Post()
  public async checkAction(
    @UserDecorator('userId') userId: string,
    @Body() eapAction: EapActionDto,
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
