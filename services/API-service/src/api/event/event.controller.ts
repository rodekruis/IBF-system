import { EventPcodeDto } from './dto/event-pcode.dto';
import { EventService } from './event.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('event')
@Controller('event')
export class EventController {
  private readonly eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  @ApiOperation({ summary: 'Check EAP actions as done' })
  @Post('close-pcode')
  public async closeEventPcode(
    @Body() eventPcodeDto: EventPcodeDto,
  ): Promise<void> {
    return await this.eventService.closeEventPcode(eventPcodeDto);
  }
}
