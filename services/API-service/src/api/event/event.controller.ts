import {
  ActivationLogDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import { EventService } from './event.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';
import { EventSummaryCountry, TriggeredArea } from '../../shared/data.model';
import { DateDto, TriggerPerLeadTimeExampleDto } from './dto/date.dto';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';
import { UserDecorator } from '../user/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import stream from 'stream';
import { Response } from 'express-serve-static-core';

@ApiBearerAuth()
@ApiTags('event')
@Controller('event')
export class EventController {
  private readonly eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get summary of active events - if any - for given country and disaster-type',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Summary of active events - if any - for given country and disaster-type.',
    type: EventSummaryCountry,
  })
  @Get(':countryCodeISO3/:disasterType')
  public async getEventSummaryCountry(
    @Param() params,
  ): Promise<EventSummaryCountry[]> {
    return await this.eventService.getEventSummaryCountry(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get date of last forecast-data-upload for given country and disaster-type.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Date of last forecast-data-upload for given country and disaster-type.',
    type: DateDto,
  })
  @Get('recent-date/:countryCodeISO3/:disasterType')
  public async getRecentDate(@Param() params): Promise<DateDto> {
    return await this.eventService.getRecentDate(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get yes/no trigger per lead-time for given country and disaster-type.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Yes/no trigger per lead-time for given country and disaster-type.',
    type: TriggerPerLeadTimeExampleDto,
  })
  @Get('triggers/:countryCodeISO3/:disasterType')
  public async getTriggerPerLeadtime(
    @Param() params,
    @Query() query,
  ): Promise<object> {
    return await this.eventService.getTriggerPerLeadtime(
      params.countryCodeISO3,
      params.disasterType,
      query.eventName,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get triggered admin-areas for given country, disaster-type and lead-time.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({ name: 'leadTime', required: false, type: 'string' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Triggered admin-areas for given country, disaster-type and lead-time.',
    type: [TriggeredArea],
  })
  @Get('triggered-areas/:countryCodeISO3/:adminLevel/:disasterType')
  public async getTriggeredAreas(
    @Param() params,
    @Query() query,
  ): Promise<TriggeredArea[]> {
    return await this.eventService.getTriggeredAreas(
      params.countryCodeISO3,
      params.disasterType,
      params.adminLevel,
      query.leadTime,
      query.eventName,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get past and current trigger activation data per admin-area and disaster-type.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Past and current trigger activation data per admin-area and disaster-type.',
    type: [ActivationLogDto],
  })
  @ApiQuery({ name: 'countryCodeISO3', required: false, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: false, type: 'string' })
  @Get('activation-log')
  public async getActivationLogData(
    @Query() query,
  ): Promise<ActivationLogDto[]> {
    return await this.eventService.getActivationLogData(
      query.countryCodeISO3,
      query.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DisasterManager)
  @ApiOperation({ summary: 'Stop trigger for given admin-area.' })
  @ApiResponse({
    status: 201,
    description: 'Trigger stopped for given admin-area.',
  })
  @ApiResponse({
    status: 404,
    description: 'No admin-area for this event.',
  })
  @Post('toggle-stopped-trigger')
  public async toggleStoppedTrigger(
    @UserDecorator('userId') userId: string,
    @Body() eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    return await this.eventService.toggleStoppedTrigger(
      userId,
      eventPlaceCodeDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Upload yes/no trigger data per leadtime for given country and disaster-type',
  })
  @ApiResponse({
    status: 201,
    description:
      'Uploaded yes/no trigger data per leadtime for given country and disaster-type.',
  })
  @Post('triggers-per-leadtime')
  public async uploadTriggersPerLeadTime(
    @Body() uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.uploadTriggerPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Post event map image (Only .png-files supported)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'eventName', required: false, type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Post event map image' })
  @Post('/event-map-image/:countryCodeISO3/:disasterType/:eventName')
  @UseInterceptors(FileInterceptor('image'))
  public async postEventMapImage(
    @UploadedFile() imageFileBlob,
    @Param() params,
  ): Promise<void> {
    await this.eventService.postEventMapImage(
      params.countryCodeISO3,
      params.disasterType,
      params.eventName,
      imageFileBlob,
    );
  }

  @ApiOperation({
    summary: 'Get event map image',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'eventName', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: 'Get event map image' })
  @Get('/event-map-image/:countryCodeISO3/:disasterType/:eventName')
  public async getEventMapImage(
    @Res() response: Response,
    @Param() params,
  ): Promise<void> {
    const blob = await this.eventService.getEventMapImage(
      params.countryCodeISO3,
      params.disasterType,
      params.eventName,
    );
    if (!blob) {
      throw new HttpException(
        'Image not found. Please upload an image using POST and try again.',
        HttpStatus.NOT_FOUND,
      );
    }
    const bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(blob, 'binary'));
    response.writeHead(HttpStatus.OK, {
      'Content-Type': 'image/png',
    });
    bufferStream.pipe(response);
  }
}
