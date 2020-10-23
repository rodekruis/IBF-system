import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EapActionsService } from './eap-actions.service';
import { User } from '../user/user.decorator';
import { ApiImplicitParam, ApiOperation } from '@nestjs/swagger';
import { EapActionDto } from './dto/eap-action.dto';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';

@Controller('eap-actions')
export class EapActionsController {
  private readonly eapActionsService: EapActionsService;

  public constructor(eapActionsService: EapActionsService) {
    this.eapActionsService = eapActionsService;
  }

  @ApiOperation({ title: 'Check EAP actions as done' })
  @Post()
  public async checkAction(
    @User('id') userId: number,
    @Body() eapAction: EapActionDto,
  ): Promise<EapActionStatusEntity> {
    return await this.eapActionsService.checkAction(userId, eapAction);
  }

  @ApiOperation({ title: 'Get EAP actions and status' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'pcode', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'event', required: true, type: 'number' })
  @Get('/:countryCode/:pcode/:event')
  public async getActionsWithStatus(
    @Param() params,
  ): Promise<EapActionEntity[]> {
    return await this.eapActionsService.getActionsWithStatus(
      params.countryCode,
      params.pcode,
      params.event,
    );
  }

  @ApiOperation({ title: 'Get areas of focus' })
  @Get('areas-of-focus')
  public async getAreasOfFocus(): Promise<AreaOfFocusEntity[]> {
    return await this.eapActionsService.getAreasOfFocus();
  }
}
