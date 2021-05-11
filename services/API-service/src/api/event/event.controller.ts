import { EventPlaceCodeDto } from './dto/event-place-code.dto';
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

    @ApiOperation({ summary: 'Close place code event' })
    @Post('close-place-code')
    public async closeEventPcode(
        @Body() eventPlaceCodeDto: EventPlaceCodeDto,
    ): Promise<void> {
        console.log('eventPlaceCodeDto: ', eventPlaceCodeDto);
        return await this.eventService.closeEventPcode(eventPlaceCodeDto);
    }
}
