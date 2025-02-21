import { Injectable } from '@nestjs/common';

import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { EventService } from '../event/event.service';
import { NotificationApiTestResponseDto } from '../notification/dto/notification-api-test-response.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProcessPipelineService {
  public constructor(
    private eventService: EventService,
    private helperService: HelperService,
    private notificationService: NotificationService,
  ) {}

  public async processEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    isApiTest = false,
  ): Promise<void | NotificationApiTestResponseDto> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const activeEventNames = await this.eventService.getActiveEventNames(
      countryCodeISO3,
      disasterType,
      lastUploadDate.cutoffMoment,
    );

    const defaultAdminLevel = (
      await this.eventService.getCountryDisasterSettings(
        countryCodeISO3,
        disasterType,
      )
    ).defaultAdminLevel;
    for (const eventName of activeEventNames) {
      if (eventName.eventName === null) {
        await this.eventService.insertAlertsPerLeadTime(
          countryCodeISO3,
          disasterType,
          null,
          [],
          lastUploadDate.timestamp,
        );
        continue;
      }

      await this.eventService.processEventAreas(
        countryCodeISO3,
        disasterType,
        defaultAdminLevel,
        eventName.eventName,
        lastUploadDate.cutoffMoment,
        lastUploadDate.timestamp,
      );
    }

    await this.eventService.closeEventsAutomatic(
      countryCodeISO3,
      disasterType,
      lastUploadDate.timestamp,
    );

    return await this.notificationService.send(
      countryCodeISO3,
      disasterType,
      isApiTest,
      lastUploadDate.timestamp,
    );
  }
}
