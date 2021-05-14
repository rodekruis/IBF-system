import { EventPlaceCodeDto } from './dto/event-place-code.dto';
import { EventService } from './event.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('event')
@Controller('event')
export class EventController {
  private readonly eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  @ApiOperation({ summary: 'Close place code event' })
  @Post('close-place-code')
  public async closeEventPcode(
    @Body() eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    return await this.eventService.closeEventPcode(eventPlaceCodeDto);
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload trigger per leadtime data',
  })
  @Post('triggers-per-leadtime')
  public async uploadTriggersPerLeadTime(
    @Body() uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.uploadTriggerPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }
}
